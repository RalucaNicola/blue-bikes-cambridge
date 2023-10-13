import * as styles from './BasemapToggle.module.css';
import { motion } from 'framer-motion';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { toggleBasemap } from '../../store/basemapSlice';
import { useAppSelector } from '../../hooks/useAppSelector';

const BasemapToggle = () => {
  const dispatch = useAppDispatch();
  const cartographicEnabled = useAppSelector((state) => state.basemapType.cartographic);
  return (
    <motion.div
      className={styles.container}
      whileHover={{ scale: 1.1, z: 0, transition: { type: 'spring', duration: 0.8 } }}
    >
      <button
        onClick={() => dispatch(toggleBasemap())}
        className={styles.basemapButton}
        style={{
          backgroundImage: cartographicEnabled
            ? "url('./assets/basemap-realistic.jpg')"
            : "url('./assets/basemap-cartographic.jpg')"
        }}
      ></button>
    </motion.div>
  );
};

export default BasemapToggle;
