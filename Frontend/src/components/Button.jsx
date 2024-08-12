import React from 'react'
import { ButtonStyle, IconLeft, IconRight } from './styled'

const Button = ({
  text,
  onClick,
  icon,
  iconPosition,
  outline,
  bold,
  big,
  disabled,
}) => {
  return (
    <button
      onClick={onClick}
    //   outline={outline}
    //   bold={bold}
    //   big={big}
    //   disabled={disabled}
    >
      {/* {icon && iconPosition === 'left' && <IconLeft>{icon}</IconLeft>} */}
      {text}
      {/* {icon && iconPosition === 'right' && <IconRight>{icon}</IconRight>} */}
    </button>
  )
}

export default Button
