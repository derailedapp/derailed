import * as React from "react"
import * as stylex from "@stylexjs/stylex"


const styles = stylex.create({
    root: {
        width: "100%",
        margin: "1rem",
        height: "3rem",
        color: "white",
        maxWidth: "28rem",
        borderRadius: "4px",
        fontSize: "20px",
        fontWeight: "600"
    }
})


const colorStyle = stylex.create({
    blurple: {
        backgroundColor: "#7364FF",
    }
})


export function ModalButton({
    content = "Placeholder",
    color = "blurple",
    type = undefined,
    onClick = undefined
}: {
    content: string;
    color: string;
    type: "button" | "submit" | "reset" | undefined;
    onClick?: any
}) {
    return (
        <button type={type} onClick={onClick} {...stylex.props(styles.root, colorStyle[color])}>
            {content}
        </button>
    )
}