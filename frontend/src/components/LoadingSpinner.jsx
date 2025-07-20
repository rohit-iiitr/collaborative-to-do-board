import "../styles/LoadingSpinner.css"

const LoadingSpinner = ({ size = "medium" }) => {
  return (
    <div className="loading-container">
      <div className={`loading-spinner ${size}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
    </div>
  )
}

export default LoadingSpinner
