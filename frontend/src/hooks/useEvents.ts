import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Event, EventCreate } from '../types';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<Event[]>('/events');
      setEvents(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch events');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const createEvent = async (data: EventCreate) => {
    const response = await api.post<Event>('/events', data);
    setEvents([...events, response.data]);
    return response.data;
  };

  const updateEvent = async (id: number, data: Partial<EventCreate>) => {
    const response = await api.put<Event>(`/events/${id}`, data);
    setEvents(events.map(e => e.id === id ? response.data : e));
    return response.data;
  };

  const deleteEvent = async (id: number) => {
    await api.delete(`/events/${id}`);
    setEvents(events.filter(e => e.id !== id));
  };

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
}

export function useEvent(id: number) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<Event>(`/events/${id}`);
        setEvent(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch event');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  return { event, isLoading, error };
}

// Made with Bob