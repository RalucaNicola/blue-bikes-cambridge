import * as styles from './HistoricalData.module.css';
import { useAppSelector } from '../../hooks/useAppSelector';
import { RootState } from '../../store/storeConfiguration';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { CalciteLabel, CalciteSwitch } from '@esri/calcite-components-react';
import { toggleAccidentsLayer, toggleRoutesLayer, toggleConstructionsLayer } from '../../store/historicalSlice';

const HistoricalData = () => {
  const accidentsVisible = useAppSelector((state: RootState) => state.historical.accidentsLayerVisible);
  const routesVisible = useAppSelector((state: RootState) => state.historical.routesLayerVisible);
  const constructionsVisible = useAppSelector((state: RootState) => state.historical.constructionsLayerVisible);
  const dispatch = useAppDispatch();

  return (
    <div className={styles.container}>
      <CalciteLabel layout='inline-space-between' scale='l'>
        Bicycle accidents{' '}
        <CalciteSwitch
          checked={accidentsVisible ? true : undefined}
          onCalciteSwitchChange={() => dispatch(toggleAccidentsLayer())}
        ></CalciteSwitch>
      </CalciteLabel>
      <div className={styles.note}>Historical accident data from January 2015 until October 2023.</div>
      <CalciteLabel layout='inline-space-between' scale='l'>
        Bicycle routes{' '}
        <CalciteSwitch
          checked={routesVisible ? true : undefined}
          onCalciteSwitchChange={() => dispatch(toggleRoutesLayer())}
        ></CalciteSwitch>
      </CalciteLabel>
      <CalciteLabel layout='inline-space-between' scale='l'>
        Construction sites{' '}
        <CalciteSwitch
          checked={constructionsVisible ? true : undefined}
          onCalciteSwitchChange={() => dispatch(toggleConstructionsLayer())}
        ></CalciteSwitch>
      </CalciteLabel>
    </div>
  );
};

export default HistoricalData;
