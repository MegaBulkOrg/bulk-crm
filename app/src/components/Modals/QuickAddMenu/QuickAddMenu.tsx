import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuildingColumns, faFolderOpen, faFileSignature  } from '@fortawesome/free-solid-svg-icons';
import styles from './quickaddmenu.module.sass';

export function QuickAddMenu() {
    const authUserRoleId = useAppSelector(state => state.auth.authUserRoleId)
    const dispatch = useAppDispatch()

    function selectModalToOpen(modalName:string) {
        dispatch(modalSwitch({open: true, modalName, itemId: null}))
    }

    return (
        <div className={styles.quickAddMenu}>
            <div className={styles.quickAddMenu__holder} />      
            <h2 className={styles.quickAddMenu__title}>Добавить...</h2>
            <ul className={styles.quickAddMenu__list}>                
                {authUserRoleId !== 1 &&
                    <li className={styles.quickAddMenu__list__item} onClick={() => selectModalToOpen('addUser')}>
                        <FontAwesomeIcon icon={faBuildingColumns} className={styles.quickAddMenu__list__item__icon} />
                        Пользователя
                    </li>                
                }
                <li className={styles.quickAddMenu__list__item} onClick={() => selectModalToOpen('addClient')}>
                    <FontAwesomeIcon icon={faBuildingColumns} className={styles.quickAddMenu__list__item__icon} />
                    Клиента
                </li>
                <li className={styles.quickAddMenu__list__item} onClick={() => selectModalToOpen('quickAddDeal')}>
                    <FontAwesomeIcon icon={faFolderOpen} className={styles.quickAddMenu__list__item__icon} />
                    Сделку
                </li>
                <li className={styles.quickAddMenu__list__item} onClick={() => selectModalToOpen('quickAddNote')}>
                    <FontAwesomeIcon icon={faFileSignature} className={styles.quickAddMenu__list__item__icon} />
                    Запись
                </li>
            </ul>
        </div>
    )
}