import { CalciteAction, CalciteLoader } from '@esri/calcite-components-react';
import * as styles from './Popup.module.css';
import { motion } from 'framer-motion';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/storeConfiguration';
import Section from '../Section';
import { roundNumber } from '../../utils/utilities';
import { Point } from '@arcgis/core/geometry';
import { RealTimeStationInformation, setSelectedStation } from '../../store/stationsSlice';

const getHeaderForSelectedStation = (selectedStation: RealTimeStationInformation): string => {
  return selectedStation.name;
};

const Popup = () => {
  const dispatch = useAppDispatch();
  const selectedStation = useSelector((state: RootState) => state.stations.selectedStation);
  const isOpen = selectedStation ? true : false;
  return (
    selectedStation && (
      <motion.div
        initial={false}
        className={styles.container}
        style={{ pointerEvents: isOpen ? 'all' : 'none' }}
        animate={isOpen ? 'visible' : 'hidden'}
        variants={{
          visible: {
            clipPath: 'inset(0% 0% 0% 0%)',
            transition: {
              type: 'spring',
              bounce: 0,
              duration: 0.4,
              delayChildren: 0.3,
              staggerChildren: 0.05
            }
          },
          hidden: {
            clipPath: 'inset(0% 0% 100% 100%)',
            transition: {
              type: 'spring',
              bounce: 0,
              duration: 0.2
            }
          }
        }}
      >
        <div className={styles.header}>
          <h1>{selectedStation.name}</h1> <></>
          <div className={styles.close}>
            <CalciteAction
              appearance='transparent'
              icon='x'
              onClick={() => {
                dispatch(setSelectedStation(null));
              }}
              scale='m'
              text={'Close modal window'}
            ></CalciteAction>
          </div>
        </div>
        <div className={styles.content}>
          <Section title='Bycicles'>{selectedStation.current_capacity}</Section>
          <Section title='Docking stations'>{selectedStation.capacity}</Section>
        </div>
      </motion.div>
    )
  );
};
export default Popup;
