import { useEffect } from 'react';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GenericElements } from 'Components/GenericElements';
import { HomeNotesItem } from 'Components/Items/HomeNotesItem';
import { useGetHomeNotesListQuery } from 'Redux/api/notes';
import { INote } from 'Redux/apiInterfaces';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { useNavigate } from 'react-router-dom';
import { tokenErrorHandler } from '../../../helpers/tokenErrorHandler';
import styles from './noteswidget.module.sass';

export function NotesWidget() {
  const authState = useAppSelector(state => state.auth)
  
  const {data = [], isLoading, isSuccess, isError, error, refetch} = useGetHomeNotesListQuery(authState.authUserRoleId === 1 
    ? {mode: 'byManager', id: authState.authUserId || 1}
    : {mode: 'all'}
  )
  const dispatch = useAppDispatch()
  
  function addNote() {
    dispatch(modalSwitch({open: true, modalName: 'addNote', itemId: null}))
  }

  const [signout] = useSignoutMutation()
  const [refresh] = useLazyRefreshQuery()
  const navigate = useNavigate()
  useEffect(() => {
      async function tokenError() {    
        if (isError && 'status' in error && (error.status === 401 || error.status === 403)) {
              const response = await tokenErrorHandler({error, dispatch, signout, authUserId:authState.authUserId, refresh})
              response ? refetch() : navigate('/login')
          }
      }
      tokenError()
  }, [isError, error])

  return (
    <section className={styles.noteswidget}>
      <div className={styles.container}>
        <h2 className={styles.noteswidget__title}>Последние записи</h2>
        {isLoading && <p className={styles.noteswidget__msg}>Загрузка...</p>}
        {isError && 'status' in error && (error.status === 401 || error.status === 403) &&
          <p className={styles.userswidget__msg}>Обновляем Access токен. Повторно получаем данные для этого виджета.</p>
        }
        {isError && 'status' in error && error.status !== 401 && error.status !== 403 &&
          <p className={styles.userswidget__msg}>Не получилось загрузить данные для этого виджета</p>
        }
        {isSuccess && Array.isArray(data) &&
          <ul className={styles.noteswidget__list}>
            <GenericElements<INote> list={data} Template={HomeNotesItem}/>
          </ul>
        }
        <button className={styles.noteswidget__addButton} onClick={addNote}>
          <FontAwesomeIcon icon={faAdd}/>
          Добавить
        </button>
      </div>
    </section>
  );
}