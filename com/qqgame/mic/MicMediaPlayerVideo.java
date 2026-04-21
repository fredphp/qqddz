package com.qqgame.mic;

import android.app.Activity;
import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.content.res.AssetManager;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnBufferingUpdateListener;
import android.media.MediaPlayer.OnCompletionListener;
import android.media.MediaPlayer.OnPreparedListener;
import android.media.MediaPlayer.OnVideoSizeChangedListener;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.view.KeyEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceHolder.Callback;
import android.view.SurfaceView;
import android.view.Window;
import android.widget.Toast;

public class MicMediaPlayerVideo extends Activity
  implements MediaPlayer.OnBufferingUpdateListener, MediaPlayer.OnCompletionListener, MediaPlayer.OnPreparedListener, MediaPlayer.OnVideoSizeChangedListener, SurfaceHolder.Callback
{
  private static final int LOCAL_AUDIO = 1;
  private static final int LOCAL_VIDEO = 4;
  private static final String MEDIA = "media";
  private static final int RESOURCES_AUDIO = 3;
  private static final int STREAM_AUDIO = 2;
  private static final int STREAM_VIDEO = 5;
  private static final String TAG = "MediaPlayerDemo";
  public static Handler s_handler = null;
  private Bundle extras;
  private SurfaceHolder holder;
  private boolean mIsVideoReadyToBePlayed = false;
  private boolean mIsVideoSizeKnown = false;
  private MediaPlayer mMediaPlayer;
  private SurfaceView mPreview;
  private int mVideoHeight;
  private int mVideoWidth;
  private String path;

  private void doCleanUp()
  {
    this.mVideoWidth = 0;
    this.mVideoHeight = 0;
    this.mIsVideoReadyToBePlayed = false;
    this.mIsVideoSizeKnown = false;
  }

  static native void nativeOnMoviePlayCompletion();

  private void playVideo(Integer paramInteger)
  {
    doCleanUp();
    try
    {
      switch (paramInteger.intValue())
      {
      case 4:
      default:
      case 5:
      }
      while (true)
      {
        this.mMediaPlayer = new MediaPlayer();
        AssetFileDescriptor localAssetFileDescriptor = getAssets().openFd(this.path);
        this.mMediaPlayer.setDataSource(localAssetFileDescriptor.getFileDescriptor(), localAssetFileDescriptor.getStartOffset(), localAssetFileDescriptor.getLength());
        this.mMediaPlayer.setDisplay(this.holder);
        this.mMediaPlayer.prepare();
        this.mMediaPlayer.setOnBufferingUpdateListener(this);
        this.mMediaPlayer.setOnCompletionListener(this);
        this.mMediaPlayer.setOnPreparedListener(this);
        this.mMediaPlayer.setOnVideoSizeChangedListener(this);
        this.mMediaPlayer.setAudioStreamType(3);
        return;
        this.path = "";
        if (this.path == "")
          Toast.makeText(this, "Please edit MediaPlayerDemo_Video Activity, and set the path variable to your media file URL.", 1).show();
      }
    }
    catch (Exception localException)
    {
      Log.e("MediaPlayerDemo", "error: " + localException.getMessage(), localException);
    }
  }

  private void releaseMediaPlayer()
  {
    if (this.mMediaPlayer != null)
    {
      this.mMediaPlayer.release();
      this.mMediaPlayer = null;
    }
  }

  private void startVideoPlayback()
  {
    Log.v("MediaPlayerDemo", "startVideoPlayback");
    this.holder.setFixedSize(this.mVideoWidth, this.mVideoHeight);
    this.mMediaPlayer.start();
  }

  public boolean dispatchKeyEvent(KeyEvent paramKeyEvent)
  {
    if ((paramKeyEvent.getKeyCode() == 4) && (paramKeyEvent.getAction() == 0))
    {
      Log.d("", "dispatchKeyEvent");
      if (paramKeyEvent.getRepeatCount() == 0)
      {
        nativeOnMoviePlayCompletion();
        finish();
      }
      return true;
    }
    return super.dispatchKeyEvent(paramKeyEvent);
  }

  public void onBufferingUpdate(MediaPlayer paramMediaPlayer, int paramInt)
  {
    Log.d("MediaPlayerDemo", "onBufferingUpdate percent:" + paramInt);
  }

  public void onCompletion(MediaPlayer paramMediaPlayer)
  {
    nativeOnMoviePlayCompletion();
    Log.d("MediaPlayerDemo", "onCompletion called");
    finish();
    Log.i("hlddz", "s_handler.obtainMessage ");
    Message localMessage = s_handler.obtainMessage();
    localMessage.what = 7;
    s_handler.sendMessage(localMessage);
    Log.i("hlddz", "sendMessage HANDLER_VIDEO_COMPLETE ");
  }

  public void onCreate(Bundle paramBundle)
  {
    super.onCreate(paramBundle);
    setContentView(2130903041);
    this.mPreview = ((SurfaceView)findViewById(2131034116));
    this.holder = this.mPreview.getHolder();
    this.holder.addCallback(this);
    this.holder.setType(3);
    this.extras = getIntent().getExtras();
    int i = this.extras.getInt("width");
    int j = this.extras.getInt("Height");
    if ((i <= 480) && (j <= 320));
    for (this.path = "Data/Movies/480x320.mp4"; ; this.path = "Data/Movies/800x480.mp4")
    {
      getWindow().setWindowAnimations(0);
      return;
    }
  }

  protected void onDestroy()
  {
    super.onDestroy();
    releaseMediaPlayer();
    doCleanUp();
    nativeOnMoviePlayCompletion();
  }

  protected void onPause()
  {
    super.onPause();
    releaseMediaPlayer();
    doCleanUp();
  }

  public void onPrepared(MediaPlayer paramMediaPlayer)
  {
    Log.d("MediaPlayerDemo", "onPrepared called");
    this.mIsVideoReadyToBePlayed = true;
    if ((this.mIsVideoReadyToBePlayed) && (this.mIsVideoSizeKnown))
      startVideoPlayback();
  }

  protected void onResume()
  {
    super.onResume();
  }

  public void onVideoSizeChanged(MediaPlayer paramMediaPlayer, int paramInt1, int paramInt2)
  {
    Log.v("MediaPlayerDemo", "onVideoSizeChanged called");
    if ((paramInt1 == 0) || (paramInt2 == 0))
      Log.e("MediaPlayerDemo", "invalid video width(" + paramInt1 + ") or height(" + paramInt2 + ")");
    do
    {
      return;
      this.mIsVideoSizeKnown = true;
      this.mVideoWidth = paramInt1;
      this.mVideoHeight = paramInt2;
    }
    while ((!this.mIsVideoReadyToBePlayed) || (!this.mIsVideoSizeKnown));
    startVideoPlayback();
  }

  public void surfaceChanged(SurfaceHolder paramSurfaceHolder, int paramInt1, int paramInt2, int paramInt3)
  {
    Log.d("MediaPlayerDemo", "surfaceChanged called");
  }

  public void surfaceCreated(SurfaceHolder paramSurfaceHolder)
  {
    Log.d("MediaPlayerDemo", "surfaceCreated called");
    playVideo(Integer.valueOf(this.extras.getInt("media")));
  }

  public void surfaceDestroyed(SurfaceHolder paramSurfaceHolder)
  {
    Log.d("MediaPlayerDemo", "surfaceDestroyed called");
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.qqgame.mic.MicMediaPlayerVideo
 * JD-Core Version:    0.6.2
 */