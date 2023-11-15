import * as styles from './StationsList.module.css';
import '@esri/calcite-components/dist/components/calcite-filter';
import { useAppSelector } from '../../hooks/useAppSelector';
import { RootState } from '../../store/storeConfiguration';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { setSelectedStation } from '../../store/stationsSlice';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { StationInformation } from '../../services/map/streamMock';
import { bikeColor, dockingColor } from '../../utils/symbology';
import { CalciteFilter, CalciteIcon, CalciteLabel } from '@esri/calcite-components-react';
import { Counts } from '../Counts';

const StationsList = () => {
  const stations = useAppSelector((state: RootState) => state.stations.stations);
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState('');
  const filteredStations = stations.filter((station) => {
    return station.name.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <>
      <CalciteFilter
        onCalciteFilterChange={(evt) => {
          setFilter(evt.target.value);
        }}
        items={stations}
      ></CalciteFilter>
      <div className={styles.container}>
        <AnimatePresence mode='popLayout'>
          {filteredStations.map((station) => {
            return (
              <motion.div
                key={station.stationID}
                onClick={() => {
                  dispatch(setSelectedStation(station));
                }}
                className={styles.stationCard}
                layout='position'
                //initial={{ scale: 1, opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h4>{station.name}</h4>
                <div style={{ display: 'flex', fontSize: '0.9rem' }}>
                  <Counts type='bikes' count={station.bikeCount}></Counts>
                  <Counts type='docks' count={Math.max(0, station.totalDocks - station.bikeCount)}></Counts>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
};

export default StationsList;
