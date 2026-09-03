package com.yymusic.service.impl;

import java.util.Date;
import java.util.List;

import com.yymusic.entity.constants.Constants;
import com.yymusic.entity.dto.TokenUserInfoDto;
import com.yymusic.entity.enums.ResponseCodeEnum;
import com.yymusic.entity.enums.UserStatusEnum;
import com.yymusic.exception.BusinessException;
import com.yymusic.redis.RedisComponent;
import com.yymusic.utils.CopyTools;
import com.yymusic.utils.FileUtils;
import jakarta.annotation.Resource;

import org.springframework.stereotype.Service;

import com.yymusic.entity.enums.PageSize;
import com.yymusic.entity.query.UserInfoQuery;
import com.yymusic.entity.po.UserInfo;
import com.yymusic.entity.vo.PaginationResultVO;
import com.yymusic.entity.query.SimplePage;
import com.yymusic.mappers.UserInfoMapper;
import com.yymusic.service.UserInfoService;
import com.yymusic.utils.StringTools;
import org.springframework.web.multipart.MultipartFile;


/**
 * 用户信息 业务接口实现
 */
@Service("userInfoService")
public class UserInfoServiceImpl implements UserInfoService {

    @Resource
    private UserInfoMapper<UserInfo, UserInfoQuery> userInfoMapper;

    @Resource
    private FileUtils fileUtils;

    @Resource
    private RedisComponent redisComponent;

    /**
     * 根据条件查询列表
     */
    @Override
    public List<UserInfo> findListByParam(UserInfoQuery param) {
        return this.userInfoMapper.selectList(param);
    }

    /**
     * 根据条件查询列表
     */
    @Override
    public Integer findCountByParam(UserInfoQuery param) {
        return this.userInfoMapper.selectCount(param);
    }

    /**
     * 分页查询方法
     */
    @Override
    public PaginationResultVO<UserInfo> findListByPage(UserInfoQuery param) {
        int count = this.findCountByParam(param);
        int pageSize = param.getPageSize() == null ? PageSize.SIZE15.getSize() : param.getPageSize();

        SimplePage page = new SimplePage(param.getPageNo(), count, pageSize);
        param.setSimplePage(page);
        List<UserInfo> list = this.findListByParam(param);
        PaginationResultVO<UserInfo> result = new PaginationResultVO(count, page.getPageSize(), page.getPageNo(), page.getPageTotal(), list);
        return result;
    }

    /**
     * 新增
     */
    @Override
    public Integer add(UserInfo bean) {
        return this.userInfoMapper.insert(bean);
    }

    /**
     * 批量新增
     */
    @Override
    public Integer addBatch(List<UserInfo> listBean) {
        if (listBean == null || listBean.isEmpty()) {
            return 0;
        }
        return this.userInfoMapper.insertBatch(listBean);
    }

    /**
     * 批量新增或者修改
     */
    @Override
    public Integer addOrUpdateBatch(List<UserInfo> listBean) {
        if (listBean == null || listBean.isEmpty()) {
            return 0;
        }
        return this.userInfoMapper.insertOrUpdateBatch(listBean);
    }

    /**
     * 多条件更新
     */
    @Override
    public Integer updateByParam(UserInfo bean, UserInfoQuery param) {
        StringTools.checkParam(param);
        return this.userInfoMapper.updateByParam(bean, param);
    }

    /**
     * 多条件删除
     */
    @Override
    public Integer deleteByParam(UserInfoQuery param) {
        StringTools.checkParam(param);
        return this.userInfoMapper.deleteByParam(param);
    }

    /**
     * 根据UserId获取对象
     */
    @Override
    public UserInfo getUserInfoByUserId(String userId) {
        return this.userInfoMapper.selectByUserId(userId);
    }

    /**
     * 根据UserId修改
     */
    @Override
    public Integer updateUserInfoByUserId(UserInfo bean, String userId) {
        return this.userInfoMapper.updateByUserId(bean, userId);
    }

    /**
     * 根据UserId删除
     */
    @Override
    public Integer deleteUserInfoByUserId(String userId) {
        return this.userInfoMapper.deleteByUserId(userId);
    }

    /**
     * 根据Email获取对象
     */
    @Override
    public UserInfo getUserInfoByEmail(String email) {
        return this.userInfoMapper.selectByEmail(email);
    }

    /**
     * 根据Email修改
     */
    @Override
    public Integer updateUserInfoByEmail(UserInfo bean, String email) {
        return this.userInfoMapper.updateByEmail(bean, email);
    }

    /**
     * 根据Email删除
     */
    @Override
    public Integer deleteUserInfoByEmail(String email) {
        return this.userInfoMapper.deleteByEmail(email);
    }

    @Override
    public void register(String email, String password, String nickName) {
        UserInfo userInfo = this.userInfoMapper.selectByEmail(email);
        if (userInfo != null) {
            throw new BusinessException("邮箱账号已经存在");
        }
        Date curDate = new Date();
        userInfo = new UserInfo();
        String userId = StringTools.getRandomNumber(Constants.LENGTH_12);
        userInfo.setUserId(userId);
        userInfo.setNickName(nickName);
        userInfo.setEmail(email);
        userInfo.setPassword(password);
		userInfo.setCreateTime(curDate);
		userInfo.setStatus(UserStatusEnum.ENABLE.getCode());
		userInfo.setAvatar(fileUtils.copyAvatar(userId));
        this.userInfoMapper.insert(userInfo);
    }

    @Override
    public TokenUserInfoDto login(String email, String password) {
        UserInfo userInfo = this.userInfoMapper.selectByEmail(email);
        if (userInfo == null || !password.equals(userInfo.getPassword())) {
            throw new BusinessException("邮箱账号或者密码错误");
        }
        if(userInfo.getStatus().equals(UserStatusEnum.DISABLE.getCode())) {
            throw new BusinessException("账号已被禁用");
        }
        UserInfo updateInfo = new UserInfo();
        updateInfo.setLastLoginTime(new Date());
        this.userInfoMapper.updateByUserId(updateInfo, userInfo.getUserId());

        TokenUserInfoDto tokenUserInfoDto = CopyTools.copy(userInfo, TokenUserInfoDto.class);
        String token = StringTools.encodeByMD5(userInfo.getUserId() + StringTools.getRandomNumber(Constants.LENGTH_20));
        tokenUserInfoDto.setToken(token);
        // 保存用户信息到Redis
        redisComponent.saveTokenUserInfoDto(tokenUserInfoDto);
        return tokenUserInfoDto;
    }

    @Override
    public void updatePassword(String oldPassword, String newPassword, String userId) {
        UserInfo userInfo = this.userInfoMapper.selectByUserId(userId);
        if(null == userInfo) {
            throw new BusinessException(ResponseCodeEnum.CODE_600);
        }
        if(!userInfo.getPassword().equals(StringTools.encodeByMD5(oldPassword))) {
            throw new BusinessException("原始密码错误");
        }

        UserInfo updateInfo = new UserInfo();
        updateInfo.setPassword(StringTools.encodeByMD5(newPassword));
        this.userInfoMapper.updateByUserId(updateInfo, userId);
    }

    @Override
    public void updateUserInfo(TokenUserInfoDto tokenUserInfoDto, MultipartFile avatar, String nickName) {
        UserInfo updateInfo = new UserInfo();
        updateInfo.setNickName(nickName);
        tokenUserInfoDto.setNickName(nickName);
        if(avatar != null && !avatar.isEmpty()) {
            String newCoverPath = fileUtils.uploadFile(avatar, Constants.FILE_FOLDER_AVATAR, tokenUserInfoDto.getUserId() + Constants.AVATAR_SUFFIX);
            updateInfo.setAvatar(newCoverPath);
            tokenUserInfoDto.setAvatar(newCoverPath);
        }
        this.userInfoMapper.updateByUserId(updateInfo, tokenUserInfoDto.getUserId());
        redisComponent.saveTokenUserInfoDto(tokenUserInfoDto);
    }
}