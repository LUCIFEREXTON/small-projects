import { pick } from "lodash"
import { useMemo, useState } from "react"

const constructFileTree = (list) => {
  const map = {}
  const roots = []

  list.forEach(item => {
    const node = pick(item, ['id', 'isFolder', 'parentId'])
    if (!(node.hasOwnProperty('isFolder') || node.hasOwnProperty('parentId') || node.hasOwnProperty('id'))) {
      throw new Error('Invalid node')
    }
    map[item.id] = { ...node, level: 1 }
  })

  list.forEach(item => {
    if (item.parentId === null) {
      roots.push(map[item.id])
    } else {
      if (!map[item.parentId].children) {
        map[item.parentId].children = []
      }
      map[item.id].level = map[item.parentId].level + 1
      map[item.parentId].children.push(map[item.id])
    }
  })

  return roots
}

const useTree = (initialNodeList) => {
  const [treeData, setTreeData] = useState(constructFileTree(initialNodeList))
  const [selectAll, setSelectAll] = useState(false)

  const isIndeterminate = useMemo(() => !selectAll && treeData.some(node => node.isSelected || node.isIndeterminate), [selectAll, treeData])

  const toggleFolder = (id) => {
    const toggleNode = (nodes) => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, isOpen: !node.isOpen }
        }
        if (node.children) {
          return { ...node, children: toggleNode(node.children) }
        }
        return node
      })
    }
    setTreeData(toggleNode(treeData))
  }

  const toggleSelect = (id) => {
    const toggleNode = (nodes) => {
      return nodes.map(node => {
        if (node.id === id) {
          const isSelected = !node.isSelected
          const updateChildren = (children) => {
            return children.map(child => ({
              ...child, isSelected,
              children: child.children ? updateChildren(child.children) : child.children
            }))
          }
          return { ...node, isSelected, children: node.children ? updateChildren(node.children) : node.children }
        }
        if (node.children) {
          return { ...node, children: toggleNode(node.children) }
        }
        return node
      })
    }
    const newTreeData = updateNodeSelection(toggleNode(treeData))
    setSelectAll(newTreeData.every(node => node.isSelected))
    setTreeData(newTreeData)
  }

  const handleSelectAll = () => {
    const isSelected = !selectAll
    const updateAllNodes = (nodes) => {
      return nodes.map(node => ({
        ...node,
        isSelected,
        children: node.children ? updateAllNodes(node.children) : node.children
      }))
    }
    setTreeData(updateNodeSelection(updateAllNodes(treeData)))
    setSelectAll(isSelected)
  }

  const updateNodeSelection = (nodes) => {
    return nodes.map(node => {
      if (node.children) {
        const children = updateNodeSelection(node.children)
        const allSelected = children.every(child => child.isSelected)
        const someSelected = children.some(child => child.isSelected || child.isIndeterminate)
        return { ...node, children, isSelected: allSelected, isIndeterminate: !allSelected && someSelected }
      }
      return node
    })
  }

  return {
    treeData,
    selectAll,
    isIndeterminate,
    toggleFolder,
    toggleSelect,
    handleSelectAll
  }
}

export default useTree
