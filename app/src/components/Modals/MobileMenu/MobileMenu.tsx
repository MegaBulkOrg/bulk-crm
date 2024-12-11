import { Sidebar } from 'Components/Sidebar';
import { useAppSelector } from 'Redux/hooks';
import styles from './mobilemenu.module.sass';

export function MobileMenu() {
    const modalSwitcher = useAppSelector(state => state.modalSwitcher)
    
    return (
        <div className={modalSwitcher.open ? `${styles.mobileMenu} ${styles.mobileMenuActive}` : styles.mobileMenu}>
            <Sidebar/>
        </div>
    )
}