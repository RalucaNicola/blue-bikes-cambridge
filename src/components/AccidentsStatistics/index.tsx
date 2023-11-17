import * as styles from './AccidentsStatistics.module.css';
import { useAppSelector } from '../../hooks/useAppSelector';
import { RootState } from '../../store/storeConfiguration';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { CalciteLabel, CalciteSwitch } from '@esri/calcite-components-react';
import { toggleAccidentsLayer } from '../../store/accidentsSlice';

const AccidentsStatistics = () => {
  const accidentsVisible = useAppSelector((state: RootState) => state.accidents.accidentsLayerVisible);
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
    </div>
  );
};

export default AccidentsStatistics;
