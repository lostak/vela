import { txClient, queryClient, MissingWalletError , registry} from './module'

import { AmmPacketData } from "./module/types/amm/packet"
import { NoData } from "./module/types/amm/packet"
import { CreatePoolPacketData } from "./module/types/amm/packet"
import { CreatePoolPacketAck } from "./module/types/amm/packet"
import { AddLiquidityPacketData } from "./module/types/amm/packet"
import { AddLiquidityPacketAck } from "./module/types/amm/packet"
import { RemoveLiquidityPacketData } from "./module/types/amm/packet"
import { RemoveLiquidityPacketAck } from "./module/types/amm/packet"
import { Params } from "./module/types/amm/params"
import { Pool } from "./module/types/amm/pool"


export { AmmPacketData, NoData, CreatePoolPacketData, CreatePoolPacketAck, AddLiquidityPacketData, AddLiquidityPacketAck, RemoveLiquidityPacketData, RemoveLiquidityPacketAck, Params, Pool };

async function initTxClient(vuexGetters) {
	return await txClient(vuexGetters['common/wallet/signer'], {
		addr: vuexGetters['common/env/apiTendermint']
	})
}

async function initQueryClient(vuexGetters) {
	return await queryClient({
		addr: vuexGetters['common/env/apiCosmos']
	})
}

function mergeResults(value, next_values) {
	for (let prop of Object.keys(next_values)) {
		if (Array.isArray(next_values[prop])) {
			value[prop]=[...value[prop], ...next_values[prop]]
		}else{
			value[prop]=next_values[prop]
		}
	}
	return value
}

function getStructure(template) {
	let structure = { fields: [] }
	for (const [key, value] of Object.entries(template)) {
		let field: any = {}
		field.name = key
		field.type = typeof value
		structure.fields.push(field)
	}
	return structure
}

const getDefaultState = () => {
	return {
				Params: {},
				Pool: {},
				PoolAll: {},
				
				_Structure: {
						AmmPacketData: getStructure(AmmPacketData.fromPartial({})),
						NoData: getStructure(NoData.fromPartial({})),
						CreatePoolPacketData: getStructure(CreatePoolPacketData.fromPartial({})),
						CreatePoolPacketAck: getStructure(CreatePoolPacketAck.fromPartial({})),
						AddLiquidityPacketData: getStructure(AddLiquidityPacketData.fromPartial({})),
						AddLiquidityPacketAck: getStructure(AddLiquidityPacketAck.fromPartial({})),
						RemoveLiquidityPacketData: getStructure(RemoveLiquidityPacketData.fromPartial({})),
						RemoveLiquidityPacketAck: getStructure(RemoveLiquidityPacketAck.fromPartial({})),
						Params: getStructure(Params.fromPartial({})),
						Pool: getStructure(Pool.fromPartial({})),
						
		},
		_Registry: registry,
		_Subscriptions: new Set(),
	}
}

// initial state
const state = getDefaultState()

export default {
	namespaced: true,
	state,
	mutations: {
		RESET_STATE(state) {
			Object.assign(state, getDefaultState())
		},
		QUERY(state, { query, key, value }) {
			state[query][JSON.stringify(key)] = value
		},
		SUBSCRIBE(state, subscription) {
			state._Subscriptions.add(JSON.stringify(subscription))
		},
		UNSUBSCRIBE(state, subscription) {
			state._Subscriptions.delete(JSON.stringify(subscription))
		}
	},
	getters: {
				getParams: (state) => (params = { params: {}}) => {
					if (!(<any> params).query) {
						(<any> params).query=null
					}
			return state.Params[JSON.stringify(params)] ?? {}
		},
				getPool: (state) => (params = { params: {}}) => {
					if (!(<any> params).query) {
						(<any> params).query=null
					}
			return state.Pool[JSON.stringify(params)] ?? {}
		},
				getPoolAll: (state) => (params = { params: {}}) => {
					if (!(<any> params).query) {
						(<any> params).query=null
					}
			return state.PoolAll[JSON.stringify(params)] ?? {}
		},
				
		getTypeStructure: (state) => (type) => {
			return state._Structure[type].fields
		},
		getRegistry: (state) => {
			return state._Registry
		}
	},
	actions: {
		init({ dispatch, rootGetters }) {
			console.log('Vuex module: lostak.vela.amm initialized!')
			if (rootGetters['common/env/client']) {
				rootGetters['common/env/client'].on('newblock', () => {
					dispatch('StoreUpdate')
				})
			}
		},
		resetState({ commit }) {
			commit('RESET_STATE')
		},
		unsubscribe({ commit }, subscription) {
			commit('UNSUBSCRIBE', subscription)
		},
		async StoreUpdate({ state, dispatch }) {
			state._Subscriptions.forEach(async (subscription) => {
				try {
					const sub=JSON.parse(subscription)
					await dispatch(sub.action, sub.payload)
				}catch(e) {
					throw new Error('Subscriptions: ' + e.message)
				}
			})
		},
		
		
		
		 		
		
		
		async QueryParams({ commit, rootGetters, getters }, { options: { subscribe, all} = { subscribe:false, all:false}, params, query=null }) {
			try {
				const key = params ?? {};
				const queryClient=await initQueryClient(rootGetters)
				let value= (await queryClient.queryParams()).data
				
					
				commit('QUERY', { query: 'Params', key: { params: {...key}, query}, value })
				if (subscribe) commit('SUBSCRIBE', { action: 'QueryParams', payload: { options: { all }, params: {...key},query }})
				return getters['getParams']( { params: {...key}, query}) ?? {}
			} catch (e) {
				throw new Error('QueryClient:QueryParams API Node Unavailable. Could not perform query: ' + e.message)
				
			}
		},
		
		
		
		
		 		
		
		
		async QueryPool({ commit, rootGetters, getters }, { options: { subscribe, all} = { subscribe:false, all:false}, params, query=null }) {
			try {
				const key = params ?? {};
				const queryClient=await initQueryClient(rootGetters)
				let value= (await queryClient.queryPool( key.index)).data
				
					
				commit('QUERY', { query: 'Pool', key: { params: {...key}, query}, value })
				if (subscribe) commit('SUBSCRIBE', { action: 'QueryPool', payload: { options: { all }, params: {...key},query }})
				return getters['getPool']( { params: {...key}, query}) ?? {}
			} catch (e) {
				throw new Error('QueryClient:QueryPool API Node Unavailable. Could not perform query: ' + e.message)
				
			}
		},
		
		
		
		
		 		
		
		
		async QueryPoolAll({ commit, rootGetters, getters }, { options: { subscribe, all} = { subscribe:false, all:false}, params, query=null }) {
			try {
				const key = params ?? {};
				const queryClient=await initQueryClient(rootGetters)
				let value= (await queryClient.queryPoolAll(query)).data
				
					
				while (all && (<any> value).pagination && (<any> value).pagination.next_key!=null) {
					let next_values=(await queryClient.queryPoolAll({...query, 'pagination.key':(<any> value).pagination.next_key})).data
					value = mergeResults(value, next_values);
				}
				commit('QUERY', { query: 'PoolAll', key: { params: {...key}, query}, value })
				if (subscribe) commit('SUBSCRIBE', { action: 'QueryPoolAll', payload: { options: { all }, params: {...key},query }})
				return getters['getPoolAll']( { params: {...key}, query}) ?? {}
			} catch (e) {
				throw new Error('QueryClient:QueryPoolAll API Node Unavailable. Could not perform query: ' + e.message)
				
			}
		},
		
		
		async sendMsgSendCreatePool({ rootGetters }, { value, fee = [], memo = '' }) {
			try {
				const txClient=await initTxClient(rootGetters)
				const msg = await txClient.msgSendCreatePool(value)
				const result = await txClient.signAndBroadcast([msg], {fee: { amount: fee, 
	gas: "200000" }, memo})
				return result
			} catch (e) {
				if (e == MissingWalletError) {
					throw new Error('TxClient:MsgSendCreatePool:Init Could not initialize signing client. Wallet is required.')
				}else{
					throw new Error('TxClient:MsgSendCreatePool:Send Could not broadcast Tx: '+ e.message)
				}
			}
		},
		async sendMsgSendRemoveLiquidity({ rootGetters }, { value, fee = [], memo = '' }) {
			try {
				const txClient=await initTxClient(rootGetters)
				const msg = await txClient.msgSendRemoveLiquidity(value)
				const result = await txClient.signAndBroadcast([msg], {fee: { amount: fee, 
	gas: "200000" }, memo})
				return result
			} catch (e) {
				if (e == MissingWalletError) {
					throw new Error('TxClient:MsgSendRemoveLiquidity:Init Could not initialize signing client. Wallet is required.')
				}else{
					throw new Error('TxClient:MsgSendRemoveLiquidity:Send Could not broadcast Tx: '+ e.message)
				}
			}
		},
		async sendMsgSendAddLiquidity({ rootGetters }, { value, fee = [], memo = '' }) {
			try {
				const txClient=await initTxClient(rootGetters)
				const msg = await txClient.msgSendAddLiquidity(value)
				const result = await txClient.signAndBroadcast([msg], {fee: { amount: fee, 
	gas: "200000" }, memo})
				return result
			} catch (e) {
				if (e == MissingWalletError) {
					throw new Error('TxClient:MsgSendAddLiquidity:Init Could not initialize signing client. Wallet is required.')
				}else{
					throw new Error('TxClient:MsgSendAddLiquidity:Send Could not broadcast Tx: '+ e.message)
				}
			}
		},
		
		async MsgSendCreatePool({ rootGetters }, { value }) {
			try {
				const txClient=await initTxClient(rootGetters)
				const msg = await txClient.msgSendCreatePool(value)
				return msg
			} catch (e) {
				if (e == MissingWalletError) {
					throw new Error('TxClient:MsgSendCreatePool:Init Could not initialize signing client. Wallet is required.')
				}else{
					throw new Error('TxClient:MsgSendCreatePool:Create Could not create message: ' + e.message)
				}
			}
		},
		async MsgSendRemoveLiquidity({ rootGetters }, { value }) {
			try {
				const txClient=await initTxClient(rootGetters)
				const msg = await txClient.msgSendRemoveLiquidity(value)
				return msg
			} catch (e) {
				if (e == MissingWalletError) {
					throw new Error('TxClient:MsgSendRemoveLiquidity:Init Could not initialize signing client. Wallet is required.')
				}else{
					throw new Error('TxClient:MsgSendRemoveLiquidity:Create Could not create message: ' + e.message)
				}
			}
		},
		async MsgSendAddLiquidity({ rootGetters }, { value }) {
			try {
				const txClient=await initTxClient(rootGetters)
				const msg = await txClient.msgSendAddLiquidity(value)
				return msg
			} catch (e) {
				if (e == MissingWalletError) {
					throw new Error('TxClient:MsgSendAddLiquidity:Init Could not initialize signing client. Wallet is required.')
				}else{
					throw new Error('TxClient:MsgSendAddLiquidity:Create Could not create message: ' + e.message)
				}
			}
		},
		
	}
}
