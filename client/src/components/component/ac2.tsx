'use client'
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '../ui/input';
import axios from 'axios';

export default function Component() {
  const [isOn, setIsOn] = useState(false);
  const [duration, setDuration] = useState(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Fetch initial state on component mount
  useEffect(() => {
    async function fetchInitialState() {
      try {
        const response = await fetch('https://homie-server.onrender.com/switch/state');
        const data = await response.json();
        if (response.ok) {
          setIsOn(data.state);
        } else {
          console.error('Failed to fetch initial state:', data.error);
        }
      } catch (error) {
        console.error('Error fetching initial state:', error);
      }
    }
    fetchInitialState();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Function to toggle AC state
  const toggleAC = async () => {
    try {
      const newState = !isOn;
      console.log('New state:', newState);
      const response = await fetch('https://homie-server.onrender.com/switch/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: newState.toString() }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('State updated successfully');
        setIsOn(newState);
      } else {
        console.error('Failed to update state:', data.error);
      }
    } catch (error) {
      console.error('Error updating state:', error);
    }
  };

  console.log('Current state:', isOn);

  const timerToggle = async () => {
    if (duration < 0) {
      setMessage('Please enter a valid duration');
      console.log('Please enter a valid duration');
      return;
    }
    const newTimerActive = !timerActive;
    setTimerActive(newTimerActive);
    const data = {
      duration,
      Active: newTimerActive,
    };
    axios.post('https://homie-server.onrender.com/timer', data)
      .then((response: any) => {
        console.log(response.data);
        setMessage("Ac timer Set to: " + duration + " minutes");
      })
      .catch((error: any) => {
        console.error(error);
      });
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 ">
        <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-lg flex flex-col gap-4">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 ">AC Control</h1>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium ">AC Status:</span>
            <div className="flex items-center space-x-2">
              <button onClick={toggleAC} className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                {isOn ? 'On' : 'Off'}
              </button>
            </div>
          </div>
          <div className="flex flex-col text-black w-full gap-4">
            <p className='text-sm font-semibold ml-1'>
              Toggle Timer
            </p>
            <div className="flex flex-row gap-2 items-center w-full">
              <Input
                type="number"
                placeholder='Enter Duration in minutes'
                onChange={(e) => {
                  setDuration(Number(e.target.value));
                  console.log('Duration:', e.target.value);
                }}
              />
              <Switch
                checked={timerActive}
                onCheckedChange={timerToggle}
              />
            </div>
            <p className='ml-1'>
              {message}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
