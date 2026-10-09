function Button({
  children,
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="
        w-full
        bg-blue-600
        text-white
        py-3
        rounded-lg
        hover:bg-blue-700
        transition
        disabled:bg-gray-400
      "
    >
      {children}
    </button>
  );
}

export default Button;