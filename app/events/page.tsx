"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { useUser } from "../context/UserContext";

interface Event {
  isBooked: any;
  id: string;
  name: string;
  description: string;
  price: number;
  date: string;
  status: string;
  hostId: string;
}

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  console.error("Warning: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
}

export default function EventsPage() {
  const { user } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    const url = new URL(window.location.href);
    const success = url.searchParams.get("success");
    const sessionId = url.searchParams.get("session_id");
    if (success && sessionId) {
      alert("Event booked successfully");
    }
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (eventId: string) => {
    try {
      setBookingId(eventId);
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");

      const { sessionId } = await response.json();
      console.log("Session ID:", sessionId);
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }
      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error("Error booking event:", error);
      setError("Failed to book event. Please try again.");
    } finally {
      setBookingId(null);
    }
  };

  const markEventAsCompleted = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/mark-as-completed`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, status: "completed" }),
      });

      if (!response.ok) throw new Error("Failed to mark event as completed");

      const data = await response.json();
      console.log("Event marked as completed:", data);
    } catch (error) {
      console.error("Error marking event as completed:", error);
      setError("Failed to mark event as completed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Available Events
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Browse and book upcoming events
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ← Back to Home
          </Link>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}
        {events.length === 0 ? (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No events available
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Check back later for new events.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
              >
                
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {event.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {event.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ${event.price.toFixed(2)}
                    </div>
                  </div>
                </div>
                {!event.isBooked && event.status === "pending" && (
                  <div className="px-4 py-4 sm:px-6">
                    <button
                      onClick={() => handleBooking(event.id)}
                      disabled={bookingId === event.id}
                      className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        bookingId === event.id
                          ? "opacity-75 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {bookingId === event.id ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Book Now"
                      )}
                    </button>
                  </div>
                )}

                {event?.hostId === user?.id && event.status === "pending" && (
                  <div className="px-4 py-4 sm:px-6">
                    <button
                      onClick={() => markEventAsCompleted(event.id)}
                      disabled={bookingId === event.id}
                      className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        bookingId === event.id
                          ? "opacity-75 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      "Mark as Completed"
                    </button>
                  </div>
                )}

                {
                  event.status === "completed" && (
                    <div className="px-4 py-4 sm:px-6">
                      <p className="text-sm text-gray-500">
                        Event completed
                      </p>
                    </div>
                  )
                }
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
