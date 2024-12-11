import { useAppDispatch, useAppSelector } from "Redux/hooks";
import { changeItemsTpl } from "Redux/slices/itemsListsSlice";
import { useEffect, useState } from "react";
import styles from './userslisttemplateitemsswitch.module.sass';

export function UsersListTemplateItemsSwitch() {
    const itemsTpl = useAppSelector(state => state.itemsLists.tpl)
    const [switcherClass, setSwitcherClass] = useState('')

    const dispatch = useAppDispatch()
    const tplSwitch = (tplTitle:string) => {
        dispatch(changeItemsTpl({tpl: tplTitle}))
    }

    useEffect(() => {
        itemsTpl === 'table'
            ? setSwitcherClass(`${styles.templateItemsSwitch__switcher} ${styles.templateItemsSwitch__switcher__table}`)
            : setSwitcherClass(`${styles.templateItemsSwitch__switcher} ${styles.templateItemsSwitch__switcher__grid}`)
    }, [itemsTpl])

    return (
        <div className={styles.templateItemsSwitch}>
            <div className={switcherClass}></div>
            <div className={itemsTpl === 'table' ? `${styles.templateItemsSwitch__tplTitle} ${styles.templateItemsSwitch__tplTitleActive}` : styles.templateItemsSwitch__tplTitle} onClick={() => tplSwitch('table')}>Таблица</div>
            <div className={itemsTpl === 'grid' ? `${styles.templateItemsSwitch__tplTitle} ${styles.templateItemsSwitch__tplTitleActive}` : styles.templateItemsSwitch__tplTitle} onClick={() => tplSwitch('grid')}>Показатели</div>
        </div>
    );
}