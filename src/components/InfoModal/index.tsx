import * as styles from './InfoModal.module.css';
import '@esri/calcite-components/dist/components/calcite-action';
import '@esri/calcite-components/dist/components/calcite-label';
import '@esri/calcite-components/dist/components/calcite-checkbox';
import { CalciteAction, CalciteCheckbox, CalciteLabel } from '@esri/calcite-components-react';
import { applicationTitle } from '../../config';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/storeConfiguration';
import { setInfoModalOptions } from '../../store/modalSlice';
import { getLocalStorageItem, setLocalStorageItem } from '../../utils/LocalStorage';

const InfoModal = () => {
  const isOpen = useSelector((state: RootState) => state.infoModal.visible);
  const isOpenOnStart = getLocalStorageItem('modalVisibleOnStart') === 'true';
  const dispatch = useAppDispatch();
  return (
    <div className={isOpen ? styles.show : styles.hide}>
      <div className={styles.modalContainer}>
        <div className={styles.header}>
          <h1>{applicationTitle}</h1>
          <div className={styles.close}>
            <CalciteAction
              appearance='transparent'
              icon='x'
              onClick={() => {
                dispatch(setInfoModalOptions({ visible: false }));
              }}
              scale='m'
              text={'Close modal window'}
            ></CalciteAction>
          </div>
        </div>
        <div className={styles.textInfo}>
          <p>Demo application for monitoring real time bicycle data in the city of Cambridge, Massachussetts.</p>
          <p>
            Accidents data from{' '}
            <a
              href='https://data.cambridgema.gov/Public-Safety/Police-Department-Crash-Data-Updated/gb5w-yva3'
              target='_blank'
            >
              Cambridge Police Department
            </a>
            .
          </p>
          <p>
            Bycicle feeds and station information from{' '}
            <a href='https://bluebikes.com/system-data' target='_blank'>
              Blue Bikes system data
            </a>
            .
          </p>
          <p>
            {' '}
            Built using{' '}
            <a href='https://developers.arcgis.com/javascript/latest/' target='_blank'>
              ArcGIS Maps SDK for JavaScript
            </a>{' '}
            and{' '}
            <a href='https://developers.arcgis.com/javascript/latest/' target='_blank'>
              React
            </a>
            .
          </p>
          <div className={styles.infoModalOptions}>
            <CalciteLabel layout='inline'>
              Show this information when application starts
              <CalciteCheckbox
                onCalciteCheckboxChange={(evt) => {
                  setLocalStorageItem('modalVisibleOnStart', evt.target.checked ? 'true' : 'false');
                }}
                checked={isOpenOnStart}
              ></CalciteCheckbox>
            </CalciteLabel>
          </div>
        </div>
        <footer>
          <p>
            <a href='https://www.esri.com' target='_blank'>
              <img src='./assets/esri_science_of_where_white.png' className={styles.logoEsri}></img>
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default InfoModal;
