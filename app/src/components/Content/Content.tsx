import { useEffect, useState } from 'react';
import { faAdd, faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Header } from 'Components/Header';
import { MobileMenu } from 'Components/Modals/MobileMenu';
import { MobileSearchForm } from 'Components/Modals/MobileSearchForm';
import { Sidebar } from 'Components/Sidebar';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { MouseEvent, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import { NoteFullInfo } from 'Components/Modals/NoteFullInfo';
import { AddUser } from 'Components/Modals/AddUser';
import { AddClient } from 'Components/Modals/AddClient';
import { AddDeal } from 'Components/Modals/AddDeal';
import { AddNote } from 'Components/Modals/AddNote';
import { UpdateUser } from 'Components/Modals/UpdateUser';
import { UpdateClient } from 'Components/Modals/UpdateClient';
import { UpdateDeal } from 'Components/Modals/UpdateDeal';
import { UpdateNote } from 'Components/Modals/UpdateNote';
import { QuickAddMenu } from 'Components/Modals/QuickAddMenu';
import { QuickAddDeal } from 'Components/Modals/QuickAddDeal';
import { QuickAddNote } from 'Components/Modals/QuickAddNote';
import { ActionConfirmation } from 'Components/Modals/ActionConfirmation';
import styles from './content.module.sass';

type TProps = {
  children?: React.ReactNode
}

export type TNotifications = {
  show: boolean, 
  status: boolean | null, 
  text: string | null
}

export function Content({children}: TProps) {
  const isMobile = useMediaQuery({ query: '(max-width: 740px)' })

  const modalSwitcher = useAppSelector(state => state.modalSwitcher)
  
  const dispatch = useAppDispatch()
  const modalRef = useRef(null);
  
  function openQuickAddItemMenu() {
    dispatch(modalSwitch({open: true, modalName: 'quickAddMenu', itemId: null}))
  }

  function modalClose(e:MouseEvent<HTMLDivElement>) {
    if(e.target === modalRef.current) dispatch(modalSwitch({open: false, modalName: '', itemId: null}))
  }

  let modalWrapperClass = `${styles.modalWrapper}`
  const modalsCentered = [
    'addUser', 'addClient', 'addDeal', 'addNote', 
    'noteFullInfo', 
    'updateUser', 'updateClient', 'updateDeal', 'updateNote',
    'quickAddDeal', 'quickAddNote',
    'ActionConfirmation'
  ]
  const modalsNotCentered = ['mobileSearch', 'mobileSidebar']
  const modalsBottom = ['quickAddMenu']
  if (modalSwitcher.open && modalsCentered.includes(modalSwitcher.modalName)) modalWrapperClass += ` ${styles.modalActiveCentered}`
  if (modalSwitcher.open && modalsNotCentered.includes(modalSwitcher.modalName)) modalWrapperClass += ` ${styles.modalActive}`
  if (modalSwitcher.open && modalsBottom.includes(modalSwitcher.modalName)) modalWrapperClass += ` ${styles.modalActiveBottom}`

  const notificationsInitialObject = {show: false, status: null, text: null}
  const [notifications, setNotifications] = useState<TNotifications>(notificationsInitialObject)
  useEffect(() => {
    if (notifications.show) setTimeout(() => setNotifications(notificationsInitialObject), 2000)
  },[notifications.show])

  return (
    <>
      <div className={styles.content}>
        <div className={styles.content__container}>  
          {!isMobile && <Sidebar/>}
          <div className={styles.content__wrapper}>
              <Header/>
              <main className={styles.main}>
                {children}
              </main>
          </div>
        </div>
        {/* {isMobile &&  */}
          <button className={styles.content__quickAddBtn} onClick={openQuickAddItemMenu}>
            <FontAwesomeIcon icon={faAdd}  />
          </button>
        {/* } */}
      </div>
      <div className={modalWrapperClass} ref={modalRef} onClick={modalClose}>
        {modalSwitcher.modalName === 'noteFullInfo' && <NoteFullInfo />}
        {modalSwitcher.modalName === 'addUser' && <AddUser setNotifications={setNotifications} />}
        {modalSwitcher.modalName === 'addClient' && <AddClient setNotifications={setNotifications} />}
        {modalSwitcher.modalName === 'addDeal' && <AddDeal setNotifications={setNotifications} />}
        {modalSwitcher.modalName === 'addNote' && <AddNote setNotifications={setNotifications} />}
        {modalSwitcher.modalName === 'updateUser' && <UpdateUser setNotifications={setNotifications} />}
        {modalSwitcher.modalName === 'updateClient' && <UpdateClient setNotifications={setNotifications} />}
        {modalSwitcher.modalName === 'updateDeal' && <UpdateDeal setNotifications={setNotifications} />}
        {modalSwitcher.modalName === 'updateNote' && <UpdateNote setNotifications={setNotifications} />}
        {modalSwitcher.modalName === 'actionConfirmation' && <ActionConfirmation />}
        {modalSwitcher.modalName === 'quickAddMenu' && <QuickAddMenu />}
        {modalSwitcher.modalName === 'quickAddDeal' && <QuickAddDeal setNotifications={setNotifications} />}
        {modalSwitcher.modalName === 'quickAddNote' && <QuickAddNote setNotifications={setNotifications} />}
        {modalSwitcher.modalName === 'mobileSearch' && <MobileSearchForm />}
        {modalSwitcher.modalName === 'mobileSidebar' && <MobileMenu />}
      </div>
      {notifications.show && <div className={styles.notifications}>
        <div className={styles.notifications__titleWrapper}>
          <h2 className={styles.notifications__title}>
            {notifications.status ? 'Успешно' : 'Ошибка'}
          </h2>
          <button className={styles.notifications__closeBtn} onClick={() => setNotifications(notificationsInitialObject)}>
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>
        <div className={styles.notifications__content}>
          <p className={styles.notifications__text}>{notifications.text}</p>
        </div>
      </div>}
    </>
  );
}