"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useUser } from "../context/UserContext";
interface Event {
  id: string;
  name: string;
  description: string;
  price: number;
  date: string;
}

export default function HostPage() {
  const { user, setUser } = useUser();
  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    price: "",
    date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: eventData.name,
          description: eventData.description,
          price: eventData.price,
          date: eventData.date,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      setMessage({ type: "success", text: "Event created successfully!" });
      setEventData({ name: "", description: "", price: "", date: "" });
    } catch (error) {
      console.error("Error creating event:", error);
      setMessage({ type: "error", text: "Failed to create event" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateConnect = async () => {
    console.log("Creating connect account");
    if (!user) return;
    setIsCreatingAccount(true);
    setMessage(null);
    try {
      const res = await fetch("/api/stripe/account", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      // Update user with new stripe account ID
      setUser({ ...user, stripeAccountId: data.stripeAccountId });

      window.location.href = data.link;
    } catch (e) {
      setMessage({ type: "error", text: "Failed to create/connect account" });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  useEffect(()=>{
    const urlParams = new URLSearchParams(window.location.search);
    const onboarding = urlParams.get('onboarding');
    console.log({onboarding})
    if(onboarding === 'true'){
      setMessage({ type: "success", text: "Connect Account Created Successfully!" });
    }
  },[]) //read query params

  console.log({ user });
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Create New Event
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Fill in the details below to create a new event for your guests
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ← Back to Home
          </Link>
        </div>

        {message && (
          <div
            className={`rounded-md p-4 mb-6 ${
              message.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
            role="alert"
          >
            <div>
              <p className="text-sm font-medium text-red-800">{message.text}</p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
        >
          <div className="flex gap-2">
            {!user?.isOnboarded && (
              <button
                onClick={handleCreateConnect}
                disabled={isCreatingAccount}
                className={`px-3 py-2 text-sm rounded-md text-white bg-indigo-600 hover:bg-indigo-700 ${
                  isCreatingAccount ? "opacity-75" : ""
                }`}
              >
                {isCreatingAccount
                  ? "Creating Strip Account..."
                  : "Create Connect Account"}
              </button>
            )}
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Event Name
            </label>
            <div className="mt-1">
              <input
                id="name"
                type="text"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={eventData.name}
                onChange={(e) =>
                  setEventData({ ...eventData, name: e.target.value })
                }
                placeholder="Enter event name"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                rows={4}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={eventData.description}
                onChange={(e) =>
                  setEventData({ ...eventData, description: e.target.value })
                }
                placeholder="Describe your event"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Price (USD)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                required
                className="appearance-none block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={eventData.price}
                onChange={(e) =>
                  setEventData({ ...eventData, price: e.target.value })
                }
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Event Date & Time
            </label>
            <div className="mt-1">
              <input
                id="date"
                type="datetime-local"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={eventData.date}
                onChange={(e) =>
                  setEventData({ ...eventData, date: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={!user?.stripeAccountId || isSubmitting}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500${
                !user?.stripeAccountId || isSubmitting
                  ? "bg-indigo-400 opacity-75 cursor-not-allowed focus:ring-indigo-300"
                  : ""
              }`}
            >
              {isSubmitting ? "Creating Event..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
