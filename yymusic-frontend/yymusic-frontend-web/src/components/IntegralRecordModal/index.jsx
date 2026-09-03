import React, { useState, useEffect } from 'react'
import { X, Loader2, Coins } from 'lucide-react'
import { getIntegralRecords } from '@/services/account'

/**
 * 积分记录弹窗组件
 * @param {object} props
 * @param {boolean} props.isOpen - 是否显示弹窗
 * @param {function} props.onClose - 关闭弹窗的回调函数
 */
const IntegralRecordModal = ({ isOpen, onClose }) => {
  // 积分记录数据
  const [integralRecords, setIntegralRecords] = useState({
    list: [],
    totalCount: 0,
    pageNo: 1,
    pageSize: 12,
    pageTotal: 0
  })
  // 加载状态
  const [loading, setLoading] = useState(false)

  // 加载积分记录
  const loadIntegralRecords = async (pageNo = 1) => {
    setLoading(true)
    try {
      const res = await getIntegralRecords({ pageNo })
      if (res) {
        setIntegralRecords(res)
      }
    } catch (error) {
      console.error('获取积分记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 当弹窗打开时加载数据
  useEffect(() => {
    if (isOpen) {
      loadIntegralRecords()
    }
  }, [isOpen])

  // 获取记录类型名称
  const getRecordTypeName = (type, amount) => {
    switch (type) {
      case 0:
        return '创作失败退回'
      case 1:
        return '创作消耗'
      case 2:
        return `充值 (￥${amount})`
      case 3:
        return '系统赠送'
      default:
        return '其他'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/60 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-800">
          <h3 className="text-lg font-semibold text-white">
            <div className="flex items-center gap-2">
              <Coins className="text-yellow-400" size={20} />
              积分记录
            </div>
          </h3>
          <button
            className="text-slate-400 hover:text-white transition-all duration-300 hover:scale-105"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-system-primary animate-spin" />
              <span className="ml-2 text-slate-400">加载中...</span>
            </div>
          ) : integralRecords.list && integralRecords.list.length > 0 ? (
            <div className="space-y-3">
              {integralRecords.list.map((record) => (
                <div
                  key={record.recordId}
                  className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg hover:bg-slate-700/50 transition-all duration-300 border border-slate-700/30 hover:border-slate-600/50"
                >
                  <div className="flex-1">
                    <p className="text-sm text-white">
                      {getRecordTypeName(record.recordType, record.amount)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {record.createTime}
                    </p>
                  </div>
                  <div
                    className={`text-sm font-medium ${record.changeIntegral > 0 ? "text-green-400" : "text-red-400"} transition-all duration-300`}
                  >
                    {record.changeIntegral > 0 ? "+" : ""}
                    {record.changeIntegral}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>暂无积分记录</p>
            </div>
          )}
        </div>
        {integralRecords.pageTotal > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-800">
            <button
                  className={`px-3 py-1 rounded text-xs transition-all duration-300 ${integralRecords.pageNo <= 1 ? "text-slate-500 cursor-not-allowed" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}`}
                  onClick={() => loadIntegralRecords(integralRecords.pageNo - 1)}
                  disabled={integralRecords.pageNo <= 1}
                >
                  上一页
                </button>
            <span className="text-xs text-slate-400">
              第 {integralRecords.pageNo} / {integralRecords.pageTotal} 页
            </span>
            <button
                  className={`px-3 py-1 rounded text-xs transition-all duration-300 ${integralRecords.pageNo >= integralRecords.pageTotal ? "text-slate-500 cursor-not-allowed" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}`}
                  onClick={() => loadIntegralRecords(integralRecords.pageNo + 1)}
                  disabled={integralRecords.pageNo >= integralRecords.pageTotal}
                >
                  下一页
                </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default IntegralRecordModal