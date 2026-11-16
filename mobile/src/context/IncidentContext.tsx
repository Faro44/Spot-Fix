import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Incident,
  Category,
  Location,
  IncidentFilter,
  IncidentStatus,
  IncidentPriority,
  IncidentComment,
  AuditLog,
} from '../types';
import {
  fetchIncidents,
  fetchCategories,
  fetchLocations,
  createIncident as dbCreateIncident,
  updateIncidentStatus as dbUpdateIncidentStatus,
  updateIncidentContent as dbUpdateIncidentContent,
  cancelIncident as dbCancelIncident,
  upvoteIncident as dbUpvoteIncident,
  addComment as dbAddComment,
  fetchComments as dbFetchComments,
  fetchAuditLogs as dbFetchAuditLogs,
  fetchPotentialDuplicates,
} from '../database/database';
import { useAuth } from './AuthContext';

interface IncidentContextType {
  incidents: Incident[];
  categories: Category[];
  locations: Location[];
  isLoading: boolean;
  filter: IncidentFilter;
  setFilter: React.Dispatch<React.SetStateAction<IncidentFilter>>;
  refreshIncidents: () => Promise<void>;
  createIncident: (data: {
    title: string;
    description: string;
    category_id: string;
    location_id: string;
    image_uri?: string;
    priority?: IncidentPriority;
  }) => Promise<Incident>;
  updateStatus: (
    incidentId: string,
    newStatus: IncidentStatus,
    notes: string,
    priority?: IncidentPriority,
    assignedArea?: string,
    assignedUser?: string
  ) => Promise<void>;
  editIncident: (
    incidentId: string,
    title: string,
    description: string,
    categoryId: string,
    locationId: string,
    imageUri?: string
  ) => Promise<void>;
  cancelIncident: (incidentId: string, reason: string) => Promise<void>;
  upvote: (incidentId: string) => Promise<void>;
  addComment: (incidentId: string, text: string) => Promise<IncidentComment>;
  getComments: (incidentId: string) => Promise<IncidentComment[]>;
  getAuditLogs: (incidentId: string) => Promise<AuditLog[]>;
  checkDuplicates: (categoryId: string, locationId: string) => Promise<Incident[]>;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<IncidentFilter>({
    status: 'all',
    priority: 'all',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [incs, cats, locs] = await Promise.all([
        fetchIncidents(filter),
        fetchCategories(true),
        fetchLocations(true),
      ]);
      setIncidents(incs);
      setCategories(cats);
      setLocations(locs);
    } catch (err) {
      console.error('Error cargando incidencias y catálogos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshIncidents = async () => {
    await loadData();
  };

  const createIncident = async (data: {
    title: string;
    description: string;
    category_id: string;
    location_id: string;
    image_uri?: string;
    priority?: IncidentPriority;
  }) => {
    if (!currentUser) throw new Error('Usuario no autenticado.');
    const newInc = await dbCreateIncident({
      ...data,
      reporter_id: currentUser.id,
    });
    await loadData();
    return newInc;
  };

  const updateStatus = async (
    incidentId: string,
    newStatus: IncidentStatus,
    notes: string,
    priority?: IncidentPriority,
    assignedArea?: string,
    assignedUser?: string
  ) => {
    if (!currentUser) throw new Error('Usuario no autenticado.');
    await dbUpdateIncidentStatus({
      incidentId,
      newStatus,
      notes,
      user: currentUser,
      priority,
      assignedArea,
      assignedUser,
    });
    await loadData();
  };

  const editIncident = async (
    incidentId: string,
    title: string,
    description: string,
    categoryId: string,
    locationId: string,
    imageUri?: string
  ) => {
    if (!currentUser) throw new Error('Usuario no autenticado.');
    await dbUpdateIncidentContent({
      incidentId,
      title,
      description,
      categoryId,
      locationId,
      imageUri,
      user: currentUser,
    });
    await loadData();
  };

  const cancelIncident = async (incidentId: string, reason: string) => {
    if (!currentUser) throw new Error('Usuario no autenticado.');
    await dbCancelIncident(incidentId, currentUser, reason);
    await loadData();
  };

  const upvote = async (incidentId: string) => {
    if (!currentUser) return;
    await dbUpvoteIncident(incidentId, currentUser.id);
    await loadData();
  };

  const addComment = async (incidentId: string, text: string) => {
    if (!currentUser) throw new Error('Usuario no autenticado.');
    const comm = await dbAddComment(incidentId, currentUser, text);
    return comm;
  };

  const getComments = async (incidentId: string) => {
    return await dbFetchComments(incidentId);
  };

  const getAuditLogs = async (incidentId: string) => {
    return await dbFetchAuditLogs(incidentId);
  };

  const checkDuplicates = async (categoryId: string, locationId: string) => {
    return await fetchPotentialDuplicates(categoryId, locationId);
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        categories,
        locations,
        isLoading,
        filter,
        setFilter,
        refreshIncidents,
        createIncident,
        updateStatus,
        editIncident,
        cancelIncident,
        upvote,
        addComment,
        getComments,
        getAuditLogs,
        checkDuplicates,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents debe utilizarse dentro de un IncidentProvider');
  }
  return context;
};

