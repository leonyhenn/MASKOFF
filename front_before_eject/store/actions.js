/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */

//action types
export const GET_MASKER_INFO = 'GET_MASKER_INFO';
export const POST_MASKER = 'POST_MASKER';
export const ADD_INFO_TO_POST = 'ADD_INFO_TO_POST';
export const LOAD_POST_MASKER = 'LOAD_POST_MASKER'; 
export const LOAD_POST_ROAST = 'LOAD_POST_ROAST'; 
export const REMOVE_INFO_FROM_POST = 'REMOVE_INFO_FROM_POST';
export const CLEAR_CACHE = 'CLEAR_CACHE';
export const SEARCH_KEYWORD = 'SEARCH_KEYWORD';
export const SWITCH_RESULT_RECOMMEND = 'SWITCH_RESULT_RECOMMEND';
export const LOAD_SEARCH_RESULT = 'LOAD_SEARCH_RESULT';
export const UPDATE_INFO_TO_POST = 'UPDATE_INFO_TO_POST';
export const ADD_CONVERSATION = 'ADD_CONVERSATION';
export const ADD_MESSAGE = 'ADD_MESSAGE';
export const ADD_MESSAGE_RIGHT_SENDING = 'ADD_MESSAGE_RIGHT_SENDING';
export const ADD_MESSAGE_RIGHT_SENT = 'ADD_MESSAGE_RIGHT_SENT';
export const NEW_SEARCH_RESULTS = 'NEW_SEARCH_RESULTS';
export const ADD_TO_SEARCH_RESULTS = 'ADD_TO_SEARCH_RESULTS';
export const PUSH_FRONTPAGE = 'PUSH_FRONTPAGE';
export const UPDATE_CHAT_PAGE_LOCATION = 'UPDATE_CHAT_PAGE_LOCATION';
export const RECORD_VOTE = 'RECORD_VOTE';
export const REMOVE_VOTE_BAR = 'REMOVE_VOTE_BAR';
export const CLEAR_CACHE_VOTE = 'CLEAR_CACHE_VOTE';
export const LOAD_OLD_CONVERSATION = 'LOAD_OLD_CONVERSATION'
export const REMOVE_CONVERSATION = 'REMOVE_CONVERSATION'
export const REMOVE_UNREAD = 'REMOVE_UNREAD'
export const LOAD_OLD_MESSAGE = 'LOAD_OLD_MESSAGE'
export const CHANGE_LEANCLOUD_STATUS = 'CHANGE_LEANCLOUD_STATUS'
export const LOAD_VOTE = 'LOAD_VOTE'
//action creaters
export const getMaskerInfo = update => ({
	type:GET_MASKER_INFO,
	payload:update
})
export const addInfoToPost = update => ({
	type:ADD_INFO_TO_POST,
	payload:update
})
export const loadPostMasker = update => ({
	type:LOAD_POST_MASKER,
	payload:update
})
export const loadPostRoast = update => ({
	type:LOAD_POST_ROAST,
	payload:update
})
export const removeInfoFromPost = update => ({
	type:REMOVE_INFO_FROM_POST,
	payload:update
})
export const clearCache = update => ({
	type:CLEAR_CACHE,
	payload:update
})
export const searchKeyword = update => ({
	type:SEARCH_KEYWORD,
	payload:update
})
export const switchResultRecommend = update => ({
	type:SWITCH_RESULT_RECOMMEND,
	payload:update
})
export const loadSearchResult = update => ({
	type:LOAD_SEARCH_RESULT,
	payload:update
})
export const updateInfoToPost = update => ({
	type:UPDATE_INFO_TO_POST,
	payload:update
})
export const addConversation = update => ({
	type:ADD_CONVERSATION,
	payload:update
})
export const loadOldConversation = update => ({
	type:LOAD_OLD_CONVERSATION,
	payload:update
})
export const removeConversation = update => ({
	type:REMOVE_CONVERSATION,
	payload:update
})
export const removeUnread = update => ({
	type:REMOVE_UNREAD,
	payload:update
})
export const addMessage = update => ({
	type:ADD_MESSAGE,
	payload:update
})
export const addMessageRightSending = update => ({
	type:ADD_MESSAGE_RIGHT_SENDING,
	payload:update
})
export const addMessageRightSent = update => ({
	type:ADD_MESSAGE_RIGHT_SENT,
	payload:update
})
export const loadOldMessage = update => ({
	type:LOAD_OLD_MESSAGE,
	payload:update
})
export const newSearchResults = update => ({
	type:NEW_SEARCH_RESULTS,
	payload:update
})
export const addToSearchResults = update => ({
	type:ADD_TO_SEARCH_RESULTS,
	payload:update
})
export const pushFrontPage = update => ({
	type:PUSH_FRONTPAGE,
	payload:update
})
export const updateChatPageLocation = update => ({
	type:UPDATE_CHAT_PAGE_LOCATION,
	payload:update
})
export const recordVote = update => ({
	type:RECORD_VOTE,
	payload:update
})
export const loadVote = update => ({
	type:LOAD_VOTE,
	payload:update
})
export const removeVoteBar = update => ({
	type:REMOVE_VOTE_BAR,
	payload:update
})
export const clearCacheVote = update => ({
	type:CLEAR_CACHE_VOTE,
	payload:update
})
export const changeLeancloudStatus = update =>({
	type:CHANGE_LEANCLOUD_STATUS,
	payload:update
})