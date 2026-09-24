import { useCallback, useEffect, useState } from 'react'
import {
  getCommunityPostErrorMessage,
  getCommunityPosts,
  getCommunityPost,
} from '../api/communityPostsApi'

const initialMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
}

export default function useCommunityPosts({
  search,
  circleId,
  postId,
  sort,
  category,
  userId,
  saved,
  page = 1,
  perPage = 15,
  enabled = true,
} = {}) {
  const [posts, setPosts] = useState([])
  const [meta, setMeta] = useState(initialMeta)
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined

    let isActive = true

    async function loadPosts() {
      setIsLoading(true)
      setError('')

      try {
        const response = postId
          ? await getCommunityPost(postId).then((response) => ({ data: [response.data], meta: { ...initialMeta, total: 1 } }))
          : await getCommunityPosts({
          circle_id: circleId || undefined,
          sort,
          search: search || undefined,
          category: category || undefined,
          user_id: userId || undefined,
          saved: saved ? 1 : undefined,
          page,
          per_page: perPage,
        })
        if (!isActive) return
        setPosts(response.data)
        setMeta(response.meta)
      } catch (requestError) {
        if (!isActive) return
        setPosts([])
        setMeta(initialMeta)
        setError(getCommunityPostErrorMessage(requestError))
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    loadPosts()
    return () => {
      isActive = false
    }
  }, [postId, circleId, sort, category, enabled, page, perPage, refreshKey, saved, search, userId])

  const retry = useCallback(() => setRefreshKey((current) => current + 1), [])

  return {
    posts,
    meta,
    isLoading,
    error,
    retry,
  }
}
