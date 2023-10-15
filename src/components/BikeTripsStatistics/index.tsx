import * as styles from './BikeTripsStatistics.module.css';
import { useAppSelector } from '../../hooks/useAppSelector';
import { RootState } from '../../store/storeConfiguration';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';

const BikeTripsStatistics = () => {
  const nextCount = useAppSelector((state: RootState) => state.bikeTrips.currentCount);
  const count = useMotionValue(0);
  const round = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, nextCount, { duration: 1 });
    return controls.stop;
  }, [nextCount]);

  return (
    <div className={styles.container}>
      <motion.div className={styles.tripCount}>{round}</motion.div> current trips
    </div>
  );
};

export default BikeTripsStatistics;
