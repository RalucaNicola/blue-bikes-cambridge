import * as styles from './StationsNotifications.module.css';
import { useAppSelector } from '../../hooks/useAppSelector';
import { RootState } from '../../store/storeConfiguration';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { setSelectedStation } from '../../store/stationsSlice';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { StationInformation } from '../../services/map/streamMock';
import { bikeColor, dockingColor } from '../../utils/symbology';
import { CalciteIcon, CalciteLabel } from '@esri/calcite-components-react';
import { Counts } from '../Counts';

const Notification = ({ station, onClick }: { station: StationInformation; onClick: React.MouseEventHandler }) => {
  return (
    <motion.div
      onClick={onClick}
      className={styles.notificationCard}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h4>{station.name}</h4>
      <div style={{ display: 'flex', fontSize: '0.9rem' }}>
        <Counts type='bikes' count={station.bikeCount}></Counts>
        <Counts type='docks' count={Math.max(0, station.totalDocks - station.bikeCount)}></Counts>
      </div>
    </motion.div>
  );
};

const StationsNotifications = () => {
  const stations = useAppSelector((state: RootState) => state.stations.stations);
  const dispatch = useAppDispatch();
  return (
    <div className={styles.container}>
      {stations.map((station) => {
        return (
          <Notification
            station={station}
            key={station.stationID}
            onClick={() => {
              dispatch(setSelectedStation(station));
            }}
          ></Notification>
        );
      })}
    </div>
  );
};

export default StationsNotifications;
