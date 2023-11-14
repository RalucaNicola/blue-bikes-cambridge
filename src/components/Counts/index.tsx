import { bikeColor, dockingColor } from '../../utils/symbology';
import * as styles from './Counts.module.css';

export const Counts = ({ type, count }: { type: string; count: number }) => {
  if (type === 'bikes') {
    return (
      <div className={styles.count} style={{ borderColor: bikeColor.toHex() }}>
        {count} bicycles
      </div>
    );
  } else if (type === 'docks') {
    return (
      <div className={styles.count} style={{ borderColor: dockingColor.toHex() }}>
        {count} docking stations
      </div>
    );
  }
};
