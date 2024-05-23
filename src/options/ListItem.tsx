import { useRef, useState } from "react"
import { MoveDrag } from "src/comps/MoveDrag"
import clsx from "clsx"
import { GoX } from "react-icons/go"
import "./ListItem.css"

type ListItemProps = {
    children?: React.ReactNode,
    listRef: React.MutableRefObject<HTMLElement>,
    spacing: number,
    label: string,
    onMove: (newIndex: number) => void,
    onRemove: () => void,
    onClearLabel: () => void 
    
}

export function ListItem(props: ListItemProps) {
    const itemRef = useRef()
    const [focus, setFocus] = useState(false)

    return (
        <div ref={itemRef} className={clsx('ListItem', {
            focus,
            spacing: props.spacing === 1,
            doubleSpacing: props.spacing === 2,
        })}>
            {props.label && (
            <div className="ListItemLabel" onClick={props.onClearLabel}>
                <span>{props.label}<GoX/></span>
            </div>
            )}
            <div className="ListItemCore">
                {/* Grippper */}
                <MoveDrag setFocus={v => setFocus(v)} itemRef={itemRef} listRef={props.listRef} onMove={props.onMove} />

                <div className="children">
                    {props.children}
                </div>

                {/* Delete */}
                <button className="close icon" onClick={e => props.onRemove()}>
                    <GoX size="1.6rem" />
                </button>
            </div>
            <div className="ListItemSub"></div>
        </div>
    )
}

