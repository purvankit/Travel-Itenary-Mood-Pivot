import L from 'leaflet'
import marker2x from 'leaflet/dist/images/marker-icon-2x.png'
import marker from 'leaflet/dist/images/marker-icon.png'
import shadow from 'leaflet/dist/images/marker-shadow.png'

let assetsPatched = false

export const locateLeafletAssets = () => {
  if (assetsPatched) return
  // Ensure Leaflet uses the configured icon URLs instead of a missing _getIconUrl implementation
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: marker2x,
    iconUrl: marker,
    shadowUrl: shadow,
  })
  assetsPatched = true
}

