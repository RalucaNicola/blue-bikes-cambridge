import * as styles from './HistoricalData.module.css';
import { useAppSelector } from '../../hooks/useAppSelector';
import { RootState } from '../../store/storeConfiguration';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { CalciteLabel, CalciteSwitch } from '@esri/calcite-components-react';
import { toggleAccidentsLayer, toggleRoutesLayer, toggleConstructionsLayer } from '../../store/historicalSlice';

const Legend = () => {
  return (
    <>
      <div className={styles.legendSymbol}>
        <div style={{ borderBottom: '1px solid #F7FBFF', width: '100px', height: 0 }}></div>
        <div> 1 - 9 routes</div>
      </div>
      <div className={styles.legendSymbol}>
        <div style={{ borderBottom: '2px solid #C6DBEF', width: '100px', height: 0 }}></div>
        <div> 10 - 24 routes</div>
      </div>
      <div className={styles.legendSymbol}>
        <div style={{ borderBottom: '3px solid #6BAED6', width: '100px', height: 0 }}></div>
        <div> 25 - 45 routes</div>
      </div>
      <div className={styles.legendSymbol}>
        <div style={{ borderBottom: '5px solid #2171B5', width: '100px', height: 0 }}></div>
        <div> 46 - 87 routes</div>
      </div>
      <div className={styles.legendSymbol}>
        <div style={{ borderBottom: '6px solid #08306B', width: '100px', height: 0 }}></div>
        <div> 88 - 147 routes</div>
      </div>
    </>
  );
};

const HistoricalData = () => {
  const accidentsVisible = useAppSelector((state: RootState) => state.historical.accidentsLayerVisible);
  const routesVisible = useAppSelector((state: RootState) => state.historical.routesLayerVisible);
  const constructionsVisible = useAppSelector((state: RootState) => state.historical.constructionsLayerVisible);
  const dispatch = useAppDispatch();

  return (
    <div className={styles.container}>
      <div>
        <CalciteLabel layout='inline-space-between' scale='l'>
          Bicycle accidents{' '}
          <CalciteSwitch
            checked={accidentsVisible ? true : undefined}
            onCalciteSwitchChange={() => dispatch(toggleAccidentsLayer())}
          ></CalciteSwitch>
        </CalciteLabel>
        <div className={styles.note}>Historical accident data from January 2015 until October 2023.</div>
      </div>
      <div>
        <CalciteLabel layout='inline-space-between' scale='l'>
          Bicycle routes{' '}
          <CalciteSwitch
            checked={routesVisible ? true : undefined}
            onCalciteSwitchChange={() => dispatch(toggleRoutesLayer())}
          ></CalciteSwitch>
        </CalciteLabel>
        {routesVisible && <Legend></Legend>}
      </div>
      <div>
        <CalciteLabel layout='inline-space-between' scale='l'>
          Construction sites{' '}
          <CalciteSwitch
            checked={constructionsVisible ? true : undefined}
            onCalciteSwitchChange={() => dispatch(toggleConstructionsLayer())}
          ></CalciteSwitch>
        </CalciteLabel>
      </div>
    </div>
  );
};

export default HistoricalData;
