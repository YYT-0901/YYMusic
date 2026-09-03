package com.yymusic.controller.notify;

import com.yymusic.service.MusicInfoService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequestMapping("/musicNotify")
public class MusicNotifyController {

    private static final String SUCCESS = "success";

    @Resource
    private MusicInfoService musicInfoService;

    @RequestMapping("/tianpuyu/{musicType}/{model}")
    public String tianpuyue(@PathVariable Integer musicType, @RequestBody String body, @PathVariable String model) {
        log.info("tianpuyue回调信息,body:{}", body);
       musicInfoService.musicCreateNotify(musicType, body, model);
        return SUCCESS;
    }

    @RequestMapping("/comfyui/{musicType}/{model}")
    public String comfyui(@PathVariable Integer musicType, @RequestBody String body, @PathVariable String model) {
        log.info("comfyui回调信息,body:{}", body);
       musicInfoService.musicCreateNotify(musicType, body, model);
        return SUCCESS;
    }
}
