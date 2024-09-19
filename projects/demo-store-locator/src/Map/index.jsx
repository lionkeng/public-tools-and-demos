import PropTypes from 'prop-types'
import { useRef, useEffect, useState, useContext } from 'react'
import mapboxgl from 'mapbox-gl'
import MarkerList from '../MarkerList'
import { AppContext } from '../Context/AppContext';
import { addUserLocationPulse } from './pulse';

import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

export const accessToken = (mapboxgl.accessToken =
  'pk.eyJ1IjoiZXhhbXBsZXMiLCJhIjoiY2lqbmp1MzNhMDBud3VvbHhqbjY1cnV2cCJ9.uGJJU2wgtXzcBNc62vY4_A')

const Map = ({ setData, onLoad, activeFeature, setActiveFeature, searchResult, denyLocation }) => {
  const mapContainer = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [features, setFeatures] = useState();
  const { activeLocation } = useContext(AppContext);

  let mapRef = useRef(null);
  const pulseRef = useRef(null);

  useEffect(() => {
    const map = (mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/examples/cm0foo08s01tn01qq2dzccr6i',
      center:  [
        -97.76095065780527,
        39.15132376255781
        ],
      zoom: 4
    }))

    map.on('style.load', () => {  
      // This is not working
      map.setConfigProperty('basemap', 'theme', 'monochrome'); 
      // This works :point-down
      //map.setConfigProperty('basemap', 'lightPreset', 'dusk');   
    });

    map.addControl(new mapboxgl.NavigationControl())

    map.on('load', () => {
      onLoad(map)
      setMapLoaded(true)
    })

    map.on('zoomend', () => {
      const locationsInView = mapRef.current.queryRenderedFeatures({ layers: ['good-locations-c3utwz'] });
      console.log("locationsInView", locationsInView);
      setFeatures(locationsInView)
      setData(locationsInView);
    });

  }, [])

  // Move Map to searched location or User's location
  useEffect(() => {
    if (activeLocation !== null) {

      // if the activeLocation is userbased and we haven't added the pulse yet - Add it
      if (activeLocation.type == 'user' && pulseRef.current == null) {
        addUserLocationPulse(mapRef, pulseRef, activeLocation);
      }

      // Fly to the activeLocation
      mapRef.current.flyTo({
        center: activeLocation.coords,
        essential: true, // this animation is considered essential with respect to prefers-reduced-motion
        zoom: 11
      });
    }

  }, [activeLocation])

  // If user does not share location 
  useEffect(() => {
  if(denyLocation) {
    // Fly to Demo City (Seattle)
    mapRef.current.flyTo({
      center: [-122.33935, 47.60774],
      essential: true, // this animation is considered essential with respect to prefers-reduced-motion
      zoom: 11
    });
  } 
  }, [denyLocation])

  // Pan to active feature
  useEffect(() => {
   
   if(!activeFeature) {
    return;
   }
    mapRef.current.easeTo({
      center: activeFeature.geometry.coordinates,
      duration: 250,
      easing(t) {
          return t;
      }
    });
  }, [activeFeature])

  return (
    <>
      <div ref={mapContainer} className='h-full w-full' />
      {mapLoaded &&
        features &&
        <MarkerList 
          features={features}
          mapRef={mapRef.current}
          searchResult={searchResult}
          setActiveFeature={setActiveFeature}
          activeFeature={activeFeature}/>
      }
    </>
  )
}

Map.propTypes = {
  data: PropTypes.any,
  onFeatureClick: PropTypes.func,
  onLoad: PropTypes.func
}

export default Map
