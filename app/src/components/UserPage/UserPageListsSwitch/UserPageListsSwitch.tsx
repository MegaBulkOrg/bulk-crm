import { useAppDispatch, useAppSelector } from "Redux/hooks";
import { changeUserPageList } from "Redux/slices/itemsListsSlice";
import { useEffect, useState } from "react";
import styles from './userpagelistsswitch.module.sass';

export function UserPageListsSwitch() {
    const itemsTpl = useAppSelector(state => state.itemsLists.userPageList)
    const [switcherClass, setSwitcherClass] = useState('')

    const dispatch = useAppDispatch()
    const listSwitch = (listTitle:string) => {
        dispatch(changeUserPageList({userPageList: listTitle}))
    }

    useEffect(() => {
        itemsTpl === 'clients'
            ? setSwitcherClass(`${styles.userpagelistsswitch__switcher} ${styles.userpagelistsswitch__switcher__clients}`)
            : setSwitcherClass(`${styles.userpagelistsswitch__switcher} ${styles.userpagelistsswitch__switcher__deals}`)
    }, [itemsTpl])

    return (
        <div className={styles.userpagelistsswitch}>
            <div className={switcherClass}></div>
            <div className={itemsTpl === 'clients' ? `${styles.userpagelistsswitch__listTitle} ${styles.userpagelistsswitch__listTitleActive}` : styles.userpagelistsswitch__listTitle} onClick={() => listSwitch('clients')}>Клиенты</div>
            <div className={itemsTpl === 'deals' ? `${styles.userpagelistsswitch__listTitle} ${styles.userpagelistsswitch__listTitleActive}` : styles.userpagelistsswitch__listTitle} onClick={() => listSwitch('deals')}>Сделки</div>
        </div>
    );
}