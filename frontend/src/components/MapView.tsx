import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import type { Activity } from '../types/api'
import { motion } from 'framer-motion'
import { locateLeafletAssets } from '../utils/leaflet'

locateLeafletAssets()

type MapViewProps = {
  activities: Activity[]
  onSuggestAlternative: (activityId: string) => void
  isReplanning?: boolean
}

const MapFitter = ({ coordinates }: { coordinates: [number, number][] }) => {
  const map = useMap()
  useEffect(() => {
    if (coordinates.length < 1) return
    const bounds = coordinates.map(([lat, lng]) => [lat, lng]) as [number, number][]
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [coordinates, map])

  return null
}

export function MapView({ activities, onSuggestAlternative, isReplanning }: MapViewProps) {
  const coordinateActivities = useMemo(
    () =>
      activities.filter(
        (activity) => activity.location?.coordinates,
      ),
    [activities],
  )

  const coordinates = coordinateActivities.map((activity) => [
    activity.location!.coordinates!.lat,
    activity.location!.coordinates!.lng,
  ]) as [number, number][]

  if (!coordinateActivities.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
        Add activities with map coordinates to visualize the route.
      </div>
    )
  }

  const firstCoord = coordinates[0]

  return (
    <div className="relative">
      <MapContainer
        center={firstCoord}
        zoom={13}
        style={{ height: 420, width: '100%', borderRadius: '24px' }}
        className="overflow-hidden shadow-2xl"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapFitter coordinates={coordinates} />
        <Polyline positions={coordinates} color="#6D5BFF" weight={4} opacity={0.7} />
        {coordinateActivities.map((activity) => {
          const coords = activity.location?.coordinates
          if (!coords) return null
          return (
            <Marker
              key={activity.id}
              position={[coords.lat, coords.lng]}
              title={activity.name}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-slate-900">{activity.name}</p>
                  {activity.startTime && (
                    <p className="text-slate-600">
                      {new Date(activity.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  <button
                    onClick={() => onSuggestAlternative(activity.id)}
                    className="mt-2 w-full rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white"
                  >
                    Suggest Alternative
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {isReplanning && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/50 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Replanning…
        </motion.div>
      )}
    </div>
  )
}

