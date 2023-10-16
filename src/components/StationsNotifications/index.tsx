import * as styles from './StationsNotifications.module.css';
import { useAppSelector } from '../../hooks/useAppSelector';
import { RootState } from '../../store/storeConfiguration';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { setSelectedStation } from '../../store/stationsSlice';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { bikeColor, overflowColor } from '../../utils/symbology';
import Color from '@arcgis/core/Color';

enum Status {
  Normal,
  Overflow,
  Shortage
}

const Notification = ({
  message,
  onClick,
  color
}: {
  message: string;
  onClick: React.MouseEventHandler;
  color: __esri.Color;
}) => {
  return (
    <motion.div
      onClick={onClick}
      className={styles.notificationCard}
      style={{ backgroundColor: `rgba(${[...color.toRgb(), 0.3].join(',')}`, border: `1px solid ${color}` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {message}
    </motion.div>
  );
};

const StationsNotifications = () => {
  const notifyingStations = useAppSelector((state: RootState) => state.stations.notifyingStations);
  const dispatch = useAppDispatch();
  return (
    <div className={styles.container}>
      {notifyingStations.map((station) => {
        let status = Status.Overflow;
        if (station.current_capacity < 5) {
          status = Status.Shortage;
        }
        const color = status === Status.Shortage ? new Color('red') : overflowColor;
        const message =
          status === Status.Shortage
            ? `Station ${station.name} should be stocked up.`
            : `Station ${station.name} is overstocked.`;
        return (
          <Notification
            message={message}
            key={station.station_id}
            onClick={() => {
              dispatch(setSelectedStation(station));
            }}
            color={color}
          ></Notification>
        );
      })}
    </div>
  );
};

export default StationsNotifications;
