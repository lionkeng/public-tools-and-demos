'use client'

import { useState, useRef, useEffect, useContext } from 'react'
import classNames from 'classnames'
import SearchBoxWrapper from './SearchBoxWrapper.jsx'
import MapboxTooltips from './MapboxTooltips'
import { AppContext } from './Context/AppContext'
import UseMyLocation from './UseMyLocation'
import LocationListing from './LocationListing.jsx'

import Map from './Map'
import getUserLocation from './utils'
import cafeLogo from './img/cafe-logo.svg'

import './styles.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faList, faMap} from '@fortawesome/free-solid-svg-icons'

export default function Home() {
  
  // Allow/Deny location sharing
  const [denyLocation, setDenyLocation ] = useState(null);
  // the data to be displayed on the map (this is static, but could be updated dynamically as the map view changes)
  const [currentViewData, setCurrentViewData] = useState([])
  // stores the feature that the user is currently viewing (triggers the popup)
  const [activeFeature, setActiveFeature] = useState()
  // the current search value, used in the controlled mapbox-search-js input
  const [searchValue, setSearchValue] = useState('')
  // the selected search result, chosen from suggestions
  const [searchResult, setSearchResult] = useState(null)
  // for toggling between map view and card view on small screens
  const [activeMobileView, setActiveMobileView] = useState('map')
  // Location context to store/set activeMap location across App
  const { activeLocation, setActiveLocation } = useContext(AppContext);

  // a ref to hold the Mapbox GL JS Map instance
  const mapInstanceRef = useRef()

  // Use Effect to request Users Location on App mount
  useEffect(() => {
    getUserLocation(setActiveLocation, setDenyLocation);
  }, []);

  // // when the map loads
  const handleMapLoad = (map) => {
    mapInstanceRef.current = map
  }

  // on click, set the active feature
  const handleFeatureClick = (feature) => {
    setActiveFeature(feature)
  }

  // set the search value as the user types
  const handleSearchChange = (newValue) => {
    setSearchValue(newValue)
  }

  const handleSearchResult = (value) => {
    setCurrentViewData('');
    setActiveLocation({
      coords: value.features[0].geometry.coordinates,
      type: 'search'
    });
    setSearchResult(value)
    return value
  }

  // toggle the map and card view on mobile devices
  const handleActiveMobileClick = () => {
    if (activeMobileView === 'map') {
      setActiveMobileView('cards')
    } else {
      setActiveMobileView('map')
    }
  }

  return (
    <>
      <main className='flex flex-col h-full relative'>
        <MapboxTooltips/>
        <div className='flex shrink-0 justify-between h-16 py-12 items-center border-b border-gray-200 bg-white z-40 '>
          <div
            className='bg-contain bg-center bg-no-repeat ml-8'
            style={{
              height: 95,
              width: 331,
              backgroundImage: `url(${cafeLogo})`
            }}
          ></div>

          <div>
        </div>
        </div>
        <div className='relative lg:flex grow shrink min-h-0'>
          {/* sidebar */}
          <div className='absolute lg:static flex flex-col top-0 p-4 w-full lg:w-96 lg:min-w-96 z-20 lg:z-30 h-full lg:h-auto bg-white'>

            {/* Searchbox for Large screens */}
            <div className="sm:hidden md:hidden lg:block">
              <UseMyLocation denyLocation={denyLocation} setDenyLocation={setDenyLocation} setSearchValue={setSearchValue}/>
              
              <SearchBoxWrapper
                searchValue={searchValue}
                handleSearchChange={handleSearchChange}
                handleSearchResult={handleSearchResult}
                activeLocation={activeLocation}
                mapInstanceRef={mapInstanceRef}
              />
            </div>
            
               
            <div className='text-2xl text-black font-semibold w-full mb-1.5 mt-6 z-0'>
              Stores
            </div>
            <div className='mb-4 z-0'>
              <div className='font-medium text-gray-500'>
                <span className="text-deepgreen font-bold">{currentViewData.length}</span> Stores nearby
              </div>
            </div>
            
            <LocationListing 
              currentViewData={currentViewData} 
              activeFeature={activeFeature} 
              handleFeatureClick={handleFeatureClick} 
            />

          </div>
          {/* end sidebar */}
          <div
            className={classNames('grow shrink-0 relative h-full lg:h-auto', {
              'z-30': activeMobileView === 'map'
            })}
          >
            {/* SearchBox for small screens */}
            <div className="lg:hidden md:w-1/3 w-4/5 absolute top-4 left-4 z-10">

            <UseMyLocation denyLocation={denyLocation} setDenyLocation={setDenyLocation} setSearchValue={setSearchValue}/>

              <SearchBoxWrapper
                searchValue={searchValue}
                handleSearchChange={handleSearchChange}
                handleSearchResult={handleSearchResult}
                activeLocation={activeLocation}
                mapInstanceRef={mapInstanceRef}
              />
            </div>
           
            <Map
              data={currentViewData}
              setData={setCurrentViewData}
              onLoad={handleMapLoad}
              onFeatureClick={handleFeatureClick}
              setActiveFeature={setActiveFeature}
              activeFeature={activeFeature}
              searchResult={searchResult}
              denyLocation={denyLocation}
            />
          </div>
        </div>
      </main>
      <div
        className='absolute z-30 bottom-5 left-1/2 transform -translate-x-1/2 lg:hidden'
        onClick={handleActiveMobileClick}
      >
        <button className='bg-deepgreen hover:bg-greenhover text-white font-bold py-2 px-4 rounded'>
          <FontAwesomeIcon
            icon={activeMobileView === 'map' ? faList : faMap}
            className='mr-2'
          />
          {activeMobileView === 'map' ? 'Cards' : 'Map'}
        </button>
      </div>
    </>
  )
}
