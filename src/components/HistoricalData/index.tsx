import * as styles from './HistoricalData.module.css';
import { useAppSelector } from '../../hooks/useAppSelector';
import { RootState } from '../../store/storeConfiguration';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { CalciteLabel, CalciteSwitch } from '@esri/calcite-components-react';
import { toggleAccidentsLayer, toggleRoutesLayer, toggleConstructionsLayer } from '../../store/historicalSlice';
import { formatDate } from '../../utils/utilities';
import { goToSelectedConstruction } from '../../services/map/historicalLayers';

const Legend = () => {
  return (
    <>
      <div className={styles.legendSymbol}>
        <div style={{ borderBottom: '1px solid #F7FBFF', width: '100px', height: 0 }}></div>
        <div> 1 - 9 trips</div>
      </div>
      <div className={styles.legendSymbol}>
        <div style={{ borderBottom: '2px solid #C6DBEF', width: '100px', height: 0 }}></div>
        <div> 10 - 24 trips</div>
      </div>
      <div className={styles.legendSymbol}>
        <div style={{ borderBottom: '3px solid #6BAED6', width: '100px', height: 0 }}></div>
        <div> 25 - 45 trips</div>
      </div>
      <div className={styles.legendSymbol}>
        <div style={{ borderBottom: '5px solid #2171B5', width: '100px', height: 0 }}></div>
        <div> 46 - 87 trips</div>
      </div>
      <div className={styles.legendSymbol}>
        <div style={{ borderBottom: '6px solid #08306B', width: '100px', height: 0 }}></div>
        <div> 88 - 147 trips</div>
      </div>
    </>
  );
};

const HistoricalData = () => {
  const accidentsVisible = useAppSelector((state: RootState) => state.historical.accidentsLayerVisible);
  const routesVisible = useAppSelector((state: RootState) => state.historical.routesLayerVisible);
  const constructionsVisible = useAppSelector((state: RootState) => state.historical.constructionsLayerVisible);
  const constructionSites = useAppSelector((state: RootState) => state.historical.constructionSites);
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
        {accidentsVisible && (
          <div className={styles.note}>Historical accident data from January 2015 until February 2024.</div>
        )}
      </div>
      <div>
        <CalciteLabel layout='inline-space-between' scale='l'>
          Bicycle trips{' '}
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
        {constructionsVisible && constructionSites.length > 0 && (
          <div>
            {constructionSites.map((site) => {
              return (
                <div
                  className={styles.constructionSite}
                  key={site.id}
                  onClick={() => goToSelectedConstruction(site.id)}
                >
                  <div className={styles.constructionSiteImage}>
                    <img src='./assets/construction.png' />
                  </div>
                  <div>
                    <header className={styles.constructionSiteTitle}>{site.address}</header>
                    <div className={styles.constructionSiteSchedule}>
                      {formatDate(site.start)} - {formatDate(site.end)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalData;
