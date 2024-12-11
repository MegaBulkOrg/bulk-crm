interface IGenericListProps<T> {
  list: Array<T & {id: number}>
  Template: React.FC<T>
}

export function GenericElements<T>({list, Template}: IGenericListProps<T>) {  
  return (
    <> {list.map(
      (propsEl) => <Template key={propsEl.id} {...propsEl} />
    )} </>
  )
}