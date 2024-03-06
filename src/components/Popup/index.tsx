import { CalciteAction, CalciteIcon, CalciteLabel, CalciteLoader } from '@esri/calcite-components-react';
import * as styles from './Popup.module.css';
import { motion } from 'framer-motion';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/storeConfiguration';
import Section from '../Section';
import { roundNumber } from '../../utils/utilities';
import { Point } from '@arcgis/core/geometry';
import { setSelectedStation } from '../../store/stationsSlice';
import { StationInformation } from '../../services/map/streamMock';
import { Counts } from '../Counts';

const getHeaderForSelectedStation = (selectedStation: StationInformation): string => {
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
          <Section title='Availability'>
            <div style={{ display: 'flex' }}>
              <Counts type='bikes' count={selectedStation.bikeCount}></Counts>
              {/* <Counts type='docks' count={Math.max(0, selectedStation.totalDocks - selectedStation.bikeCount)}></Counts> */}
            </div>
          </Section>
          <Section title='Rental methods'>
            <div style={{ display: 'flex', gap: '10px' }}>
              <CalciteLabel layout='inline' scale='m'>
                <CalciteIcon icon='key' scale='m'></CalciteIcon> Key
              </CalciteLabel>

              <CalciteLabel layout='inline' scale='m'>
                <CalciteIcon icon='credit-card' scale='m'></CalciteIcon> Credit card
              </CalciteLabel>
            </div>
          </Section>
          {selectedStation.hasKeyDispenser ? (
            <div>Has a key dispenser.</div>
          ) : (
            <div> Doesn't have a key dispenser.</div>
          )}
        </div>
      </motion.div>
    )
  );
};
export default Popup;
