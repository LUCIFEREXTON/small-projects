import React, { useEffect, useRef, useState } from 'react'
import { useFileSystem } from '../context/FileSystemContext'

const EditableExplorerName = ({ initialName, fileExplorerId }) => {
	const { updateExplorer, createExplorer } = useFileSystem()
	const [name, setName] = useState(initialName)
	const [isEditing, setIsEditing] = useState(false)
	const [error, setError] = useState(null)
	const inputRef = useRef(null)

	useEffect(() => {
		setName(initialName)
	}, [initialName])

	useEffect(() => {
		if (isEditing) {
			inputRef.current.focus()
		}
	}, [isEditing])

	const handleClick = () => {
		setIsEditing(true)
	}

	const handleChange = (e) => {
		setName(e.target.value)
	}

	const handleBlur = async () => {
		setIsEditing(false)
		setError(null)

		const api = fileExplorerId ? updateExplorer : createExplorer

		if (name !== initialName) {
			try {
				await api(name)
			} catch (err) {
				setError(err.response?.data.message || err.message || 'An error occurred')
			}
		}
	}

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			e.target.blur()
		}
	}

	return (
		<div
			onClick={handleClick}
			style={{
				cursor: 'pointer',
				color: error ? 'red' : 'inherit'
			}}
		>
			{isEditing ? (
				<input
					ref={inputRef}
					type="text"
					value={name}
					onChange={handleChange}
					onBlur={handleBlur}
					onKeyDown={handleKeyDown}
					style={{
						padding: '0',
						border: 'none',
						background: 'transparent',
						color: error ? 'red' : 'inherit',
						fontSize: 'inherit',
						fontFamily: 'inherit'
					}}
				/>
			) : (
				<span>{name}</span>
			)}
			{error && <div style={{ fontSize: '0.6em', marginTop: '-2px' }}>{error}</div>}
		</div>
	)
}

export default EditableExplorerName
