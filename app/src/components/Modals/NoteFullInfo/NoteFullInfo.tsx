import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose, faHurricane, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'Redux/hooks';
import { modalSwitch } from 'Redux/slices/modalSwitcherSlice';
import { useNavigate } from "react-router-dom";
import { useGetCurrentNoteQuery } from 'Redux/api/notes';
import { useLazyRefreshQuery, useSignoutMutation } from 'Redux/api/auth';
import { tokenErrorHandler } from "../../../helpers/tokenErrorHandler";
import DOMPurify from 'dompurify';
import styles from './notefullinfo.module.sass';


export function NoteFullInfo() {
    const dispatch = useAppDispatch()
    const modalRef = useRef(null);
    function modalClose() { 
       dispatch(modalSwitch({open: false, modalName: '', itemId: null}))
    }
    
    const noteId = useAppSelector(state => state.modalSwitcher.itemId)
    const { data, isLoading, isSuccess, isError, error, refetch } = useGetCurrentNoteQuery(Number(noteId));

    const [signout] = useSignoutMutation()
    const authState = useAppSelector(state => state.auth)
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

    const safeContent = isSuccess && 'id' in data
        ?   DOMPurify.sanitize(data.content)
        : ''
    
    return (
        <div className={styles.noteFullInfo} ref={modalRef}>
            <button className={styles.noteFullInfo__closeBtn} onClick={modalClose}>
                <FontAwesomeIcon icon={faClose} />
            </button>
            {isLoading &&
                <FontAwesomeIcon className={styles.noteFullInfo__spinner} icon={faHurricane} spin />
            }
            {isSuccess && 'id' in data && <>
                <h2 className={styles.noteFullInfo__title}>{data.title}</h2>
                <div className={styles.noteFullInfo__textWrapper} dangerouslySetInnerHTML={{ __html: safeContent }} />

                <button className={styles.noteFullInfo__editButton} 
                    onClick={() => dispatch(modalSwitch({open: true, modalName: 'updateNote', itemId: noteId}))}
                >
                    <FontAwesomeIcon icon={faPenToSquare} />
                    Редактировать
                </button>
            </>}
        </div>
    )
}