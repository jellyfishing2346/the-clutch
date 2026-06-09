'use client'

import { useRef, useEffect, useState } from 'react'
import { getCategoryColor } from '@/lib/utils'
import { TASK_CATEGORIES, MAP_CONFIG } from 'shared'
import type { Task } from 'shared'

const getColor = getCategoryColor

interface TaskMapProps {
  tasks: Task[]
  onTaskSelect?: (task: Task) => void
  selectedTaskId?: string
  height?: string
}

export function TaskMap({ tasks, onTaskSelect, selectedTaskId, height = '100%' }: TaskMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    if (!token) {
      setMapError(true)
      return
    }

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      mapboxgl.accessToken = token

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [MAP_CONFIG.defaultCenter.lng, MAP_CONFIG.defaultCenter.lat],
        zoom: MAP_CONFIG.defaultZoom,
      })

      map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

      map.on('load', () => {
        setMapLoaded(true)

        tasks.forEach(task => {
          const el = document.createElement('div')
          el.className = 'task-marker'
          el.style.cssText = `
            width: 36px; height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2.5px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            cursor: pointer;
            background: ${getColor(task.category)};
            transition: transform 0.2s, box-shadow 0.2s;
          `
          el.setAttribute('aria-label', task.title)

          const inner = document.createElement('div')
          inner.style.cssText = `
            width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            transform: rotate(45deg);
            font-size: 14px;
          `
          inner.textContent = TASK_CATEGORIES[task.category]?.icon ?? '📍'
          el.appendChild(inner)

          el.addEventListener('click', () => onTaskSelect?.(task))
          el.addEventListener('mouseenter', () => {
            el.style.transform = 'rotate(-45deg) scale(1.15)'
            el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)'
          })
          el.addEventListener('mouseleave', () => {
            el.style.transform = 'rotate(-45deg)'
            el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'
          })

          new mapboxgl.Marker(el)
            .setLngLat([task.location.lng, task.location.lat])
            .addTo(map)
        })
      })

      mapRef.current = map
    }).catch(() => setMapError(true))

    return () => {
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove()
        mapRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (mapError) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-clutch-50 to-purple-50 rounded-2xl"
        style={{ height }}
      >
        <div className="text-center p-8">
          <div className="text-5xl mb-4">🗺️</div>
          <p className="font-semibold text-gray-700 mb-1">Map Preview</p>
          <p className="text-sm text-gray-500 mb-4">Add a Mapbox token to enable the live map.</p>
          {/* Simulated map pins for demo */}
          <div className="relative w-72 h-48 bg-clutch-100 rounded-xl overflow-hidden mx-auto">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, #e2e8f0 0px, #e2e8f0 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #e2e8f0 0px, #e2e8f0 1px, transparent 1px, transparent 40px)' }}
            />
            {tasks.map((task, i) => (
              <button
                key={task.id}
                onClick={() => onTaskSelect?.(task)}
                className="absolute w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-xs hover:scale-110 transition-transform"
                style={{
                  background: getColor(task.category),
                  left: `${15 + (i * 23) % 65}%`,
                  top: `${20 + (i * 31) % 55}%`,
                }}
                title={task.title}
              >
                {TASK_CATEGORIES[task.category]?.icon ?? '📍'}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <div ref={mapContainer} className="absolute inset-0 rounded-2xl overflow-hidden" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-clutch-50 rounded-2xl">
          <div className="text-center">
            <div className="animate-spin text-3xl mb-2">◌</div>
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}
