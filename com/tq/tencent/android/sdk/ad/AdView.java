package com.tq.tencent.android.sdk.ad;

import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.net.Uri;
import android.os.Handler;
import android.os.Message;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.util.DisplayMetrics;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.animation.Animation;
import android.view.animation.Animation.AnimationListener;
import android.view.animation.TranslateAnimation;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ImageView.ScaleType;
import android.widget.RelativeLayout;
import android.widget.RelativeLayout.LayoutParams;
import android.widget.ViewFlipper;
import com.tq.tencent.android.sdk.Domain;
import com.tq.tencent.android.sdk.SdkCallException;
import com.tq.tencent.android.sdk.SdkCallbackHandler;
import com.tq.tencent.android.sdk.Tencent;
import com.tq.tencent.android.sdk.common.CommonUtil;
import com.tq.tencent.android.sdk.common.ReportInfoManager;
import com.tq.tencent.android.sdk.communicator.APNUtil;
import com.tq.tencent.android.sdk.cp_config.AppInfoConfig;
import com.tq.tencent.android.sdk.download.FileDownLoad;
import com.tq.tencent.android.sdk.download.FileDownLoad.FDownLoadItem;
import com.tq.tencent.android.sdk.download.FileDownLoad.FileDownLoadListener;
import com.tq.tencent.android.sdk.viewutil.FaceUtil;
import com.tq.tencent.sdk.R.drawable;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import org.json.JSONArray;
import org.json.JSONObject;

public class AdView extends RelativeLayout
  implements FileDownLoad.FileDownLoadListener
{
  private static final long ADVIEW_ANI_DURATION = 300L;
  private static final int ADVIEW_CONTENT_CHANGE = 101;
  private static final long ADVIEW_HIDE_DURATION = 500L;
  private static final int CHANGE_AD_ORIENTATION = 106;
  private static final int DEFAUTL_SCREEN_HEIGHT = 800;
  private static final int DEFAUTL_SCREEN_WIDTH = 480;
  private static final long DELAY_REQUEST_AD_TIME = 5000L;
  private static final int MAX_AD_HEIGHT_H = 118;
  private static final int MAX_AD_HEIGHT_V = 117;
  private static final int MAX_AD_WIDTH_H = 789;
  private static final int MAX_AD_WIDTH_V = 469;
  private static final int REQUEST_AD = 105;
  private static final int REQUEST_AD_FAILED = 104;
  private static final int REQUEST_AD_SUCCEED = 103;
  private static final int VIEW_FLIPPER_ID = 1000;
  private static final int VIEW_START_ID = 1003;
  private ViewFlipper adViewFlipper;
  private ImageView closeBtn;
  private FileDownLoad fildDownload;
  private TranslateAnimation hideAction;
  private boolean isCloseAd = false;
  private boolean isRequestAd = false;
  private AdListener mAdListener;
  private AdHandler mHandler;
  private float scaleXY;
  private int sceneOrientation = 1;
  private TranslateAnimation showAction;
  private Button startBtn;
  private long startShowTime;

  public AdView(Context paramContext)
  {
    this(paramContext, null, 0);
  }

  public AdView(Context paramContext, AttributeSet paramAttributeSet)
  {
    this(paramContext, paramAttributeSet, 0);
  }

  public AdView(Context paramContext, AttributeSet paramAttributeSet, int paramInt)
  {
    super(paramContext, paramAttributeSet, paramInt);
    init(paramContext);
  }

  private void addAdTimeToReport()
  {
    if (this.startShowTime > 0L)
    {
      int i = (int)(System.currentTimeMillis() - this.startShowTime) / 1000;
      ReportInfoManager.getInstance().addReportAdInfo(0, "time", i);
      this.startShowTime = 0L;
    }
  }

  private void addAdToList(AdInfo paramAdInfo)
  {
    ArrayList localArrayList = AdManager.getInstance().getAdInfoList();
    Iterator localIterator = localArrayList.iterator();
    do
      if (!localIterator.hasNext())
      {
        localArrayList.add(paramAdInfo);
        return;
      }
    while (((AdInfo)localIterator.next()).id != paramAdInfo.id);
  }

  private int getSceneOrientation(Context paramContext)
  {
    return paramContext.getResources().getConfiguration().orientation;
  }

  private void init(Context paramContext)
  {
    int i = getResources().getDisplayMetrics().widthPixels;
    int j = getResources().getDisplayMetrics().heightPixels;
    if (i < j);
    for (int k = i; ; k = j)
    {
      this.scaleXY = (1.0F * k / 480.0F);
      setClickable(true);
      setVisibility(4);
      this.mHandler = new AdHandler();
      this.fildDownload = new FileDownLoad();
      this.fildDownload.setDownLoadListener(this);
      this.sceneOrientation = getSceneOrientation(paramContext);
      setFocusable(false);
      setBackgroundColor(Color.argb(180, 0, 0, 0));
      setPadding((int)(0.5F + 5.0F * this.scaleXY), (int)(0.5F + 5.0F * this.scaleXY), (int)(0.5F + 5.0F * this.scaleXY), (int)(0.5F + 5.0F * this.scaleXY));
      if ((AppInfoConfig.getPLATFORM_ID() == "1009") && (!CommonUtil.checkAppExist(getContext(), "com.tencent.qqgame")))
        this.mHandler.sendEmptyMessageDelayed(105, 5000L);
      return;
    }
  }

  private void onAdChangeOrientation()
  {
  }

  private void onAdStartShow()
  {
    AdInfo localAdInfo = (AdInfo)this.adViewFlipper.getCurrentView().getTag();
    if (localAdInfo != null)
    {
      this.mHandler.removeMessages(101);
      this.mHandler.sendEmptyMessageDelayed(101, 1000 * localAdInfo.adTime);
    }
  }

  private void onAdViewClosed()
  {
    AdInfo localAdInfo = (AdInfo)this.adViewFlipper.getCurrentView().getTag();
    if (localAdInfo != null)
      ReportInfoManager.getInstance().addReportAdInfo(localAdInfo.id, "close", 1);
    addAdTimeToReport();
    this.isCloseAd = true;
    TranslateAnimation localTranslateAnimation = new TranslateAnimation(1, 0.0F, 1, 0.0F, 1, 0.0F, 1, -1.0F);
    localTranslateAnimation.setDuration(500L);
    localTranslateAnimation.setAnimationListener(new Animation.AnimationListener()
    {
      public void onAnimationEnd(Animation paramAnonymousAnimation)
      {
        AdView.this.removeAllAdContent();
        AdView.this.setVisibility(8);
      }

      public void onAnimationRepeat(Animation paramAnonymousAnimation)
      {
      }

      public void onAnimationStart(Animation paramAnonymousAnimation)
      {
      }
    });
    startAnimation(localTranslateAnimation);
  }

  private void removeAllAdContent()
  {
    removeAllViews();
    setBackgroundDrawable(null);
    this.mHandler.removeMessages(101);
    this.mHandler.removeMessages(106);
    if (this.adViewFlipper != null)
    {
      this.adViewFlipper.stopFlipping();
      this.adViewFlipper.clearAnimation();
      this.adViewFlipper.removeAllViews();
    }
  }

  private void showAd()
  {
    if (this.sceneOrientation == 1)
    {
      showAdVertical();
      return;
    }
    showAdHorizonal();
  }

  private void showAdHorizonal()
  {
    setVisibility(0);
    this.showAction = new TranslateAnimation(1, 1.0F, 1, 0.0F, 1, 0.0F, 1, 0.0F);
    this.showAction.setDuration(300L);
    this.hideAction = new TranslateAnimation(1, 0.0F, 1, -1.0F, 1, 0.0F, 1, 0.0F);
    this.hideAction.setDuration(300L);
    this.adViewFlipper = new ViewFlipper(getContext());
    this.adViewFlipper.setId(1000);
    this.adViewFlipper.setInAnimation(this.showAction);
    this.adViewFlipper.setOutAnimation(this.hideAction);
    int i = (int)(0.5F + 118.0F * this.scaleXY);
    RelativeLayout.LayoutParams localLayoutParams1 = new RelativeLayout.LayoutParams((int)(0.5F + 789.0F * this.scaleXY), i);
    localLayoutParams1.addRule(11);
    localLayoutParams1.addRule(10);
    this.adViewFlipper.setLayoutParams(localLayoutParams1);
    ArrayList localArrayList = AdManager.getInstance().getAdInfoList();
    for (int j = 0; ; j++)
    {
      if (j >= localArrayList.size())
      {
        addView(this.adViewFlipper);
        this.closeBtn = new ImageView(getContext());
        this.closeBtn.setImageResource(R.drawable.ad_close);
        this.closeBtn.setClickable(true);
        this.closeBtn.setPadding(10, 2, 2, 10);
        RelativeLayout.LayoutParams localLayoutParams2 = new RelativeLayout.LayoutParams(-2, -2);
        localLayoutParams2.addRule(10);
        localLayoutParams2.addRule(11);
        this.closeBtn.setLayoutParams(localLayoutParams2);
        this.closeBtn.setOnClickListener(new View.OnClickListener()
        {
          public void onClick(View paramAnonymousView)
          {
            AdView.this.onAdViewClosed();
          }
        });
        addView(this.closeBtn);
        onAdStartShow();
        return;
      }
      addAdToContent((AdInfo)localArrayList.get(j));
    }
  }

  private void showAdVertical()
  {
    setVisibility(0);
    this.showAction = new TranslateAnimation(1, 1.0F, 1, 0.0F, 1, 0.0F, 1, 0.0F);
    this.showAction.setDuration(300L);
    this.hideAction = new TranslateAnimation(1, 0.0F, 1, -1.0F, 1, 0.0F, 1, 0.0F);
    this.hideAction.setDuration(300L);
    this.adViewFlipper = new ViewFlipper(getContext());
    this.adViewFlipper.setId(1000);
    this.adViewFlipper.setInAnimation(this.showAction);
    this.adViewFlipper.setOutAnimation(this.hideAction);
    int i = (int)(0.5F + 117.0F * this.scaleXY);
    RelativeLayout.LayoutParams localLayoutParams1 = new RelativeLayout.LayoutParams((int)(0.5F + 469.0F * this.scaleXY), i);
    localLayoutParams1.addRule(14);
    this.adViewFlipper.setLayoutParams(localLayoutParams1);
    ArrayList localArrayList = AdManager.getInstance().getAdInfoList();
    for (int j = 0; ; j++)
    {
      if (j >= localArrayList.size())
      {
        addView(this.adViewFlipper);
        this.closeBtn = new ImageView(getContext());
        this.closeBtn.setImageResource(R.drawable.ad_close);
        this.closeBtn.setClickable(true);
        this.closeBtn.setPadding(10, 2, 2, 10);
        RelativeLayout.LayoutParams localLayoutParams2 = new RelativeLayout.LayoutParams(-2, -2);
        localLayoutParams2.addRule(10);
        localLayoutParams2.addRule(11);
        this.closeBtn.setLayoutParams(localLayoutParams2);
        this.closeBtn.setOnClickListener(new View.OnClickListener()
        {
          public void onClick(View paramAnonymousView)
          {
            AdView.this.onAdViewClosed();
          }
        });
        addView(this.closeBtn);
        onAdStartShow();
        return;
      }
      addAdToContent((AdInfo)localArrayList.get(j));
    }
  }

  public void addAdToContent(final AdInfo paramAdInfo)
  {
    ImageView localImageView = new ImageView(getContext());
    localImageView.setImageBitmap(paramAdInfo.adBitmap);
    localImageView.setScaleType(ImageView.ScaleType.FIT_XY);
    localImageView.setLayoutParams(new RelativeLayout.LayoutParams(-1, -1));
    localImageView.setOnClickListener(new View.OnClickListener()
    {
      public void onClick(View paramAnonymousView)
      {
        ReportInfoManager.getInstance().addReportAdInfo(paramAdInfo.id, "click", 1);
        if (paramAdInfo.urlType == 0)
          Tencent.getInstance().showWebViewActivity(AdView.this.getContext(), paramAdInfo.adUrl);
        while (paramAdInfo.urlType != 1)
          return;
        ReportInfoManager.getInstance().addReportAdInfo(paramAdInfo.id, "adDown", 1);
        Intent localIntent = new Intent("android.intent.action.VIEW", Uri.parse(paramAdInfo.adUrl));
        AdView.this.getContext().startActivity(localIntent);
      }
    });
    localImageView.setTag(paramAdInfo);
    this.adViewFlipper.addView(localImageView);
  }

  public void checkAndshowAdContent()
  {
    Iterator localIterator = AdManager.getInstance().getAdInfoList().iterator();
    do
      if (!localIterator.hasNext())
      {
        this.mHandler.sendEmptyMessage(103);
        return;
      }
    while (((AdInfo)localIterator.next()).adBitmap != null);
  }

  public void fileDownloadError(String paramString, FileDownLoad.FDownLoadItem paramFDownLoadItem)
  {
    Message localMessage = this.mHandler.obtainMessage(104);
    localMessage.arg1 = 1;
    this.mHandler.sendMessage(localMessage);
  }

  public void fileDownloadFinnish(FileDownLoad.FDownLoadItem paramFDownLoadItem)
  {
    AdInfo localAdInfo = (AdInfo)paramFDownLoadItem.listenObject;
    localAdInfo.adBitmap = FaceUtil.getRoundedCornerBitmap(BitmapFactory.decodeFile(AdInfo.getAdSDCardFilePath(localAdInfo.picUrl)), 10.0F);
    if (localAdInfo.adBitmap == null)
    {
      Message localMessage = this.mHandler.obtainMessage(104);
      localMessage.arg1 = 1;
      this.mHandler.sendMessage(localMessage);
    }
    checkAndshowAdContent();
  }

  public void fileDownloadStart(long paramLong, FileDownLoad.FDownLoadItem paramFDownLoadItem)
  {
  }

  public void fileDownloadUpdate(long paramLong1, long paramLong2, FileDownLoad.FDownLoadItem paramFDownLoadItem)
  {
  }

  protected void onAttachedToWindow()
  {
    super.onAttachedToWindow();
  }

  protected void onDetachedFromWindow()
  {
    super.onDetachedFromWindow();
    if (getVisibility() == 0)
      addAdTimeToReport();
  }

  protected void onFinishInflate()
  {
  }

  protected void onLayout(boolean paramBoolean, int paramInt1, int paramInt2, int paramInt3, int paramInt4)
  {
    super.onLayout(paramBoolean, paramInt1, paramInt2, paramInt3, paramInt4);
  }

  protected void onMeasure(int paramInt1, int paramInt2)
  {
    super.onMeasure(paramInt1, paramInt2);
  }

  protected void onSizeChanged(int paramInt1, int paramInt2, int paramInt3, int paramInt4)
  {
    super.onSizeChanged(paramInt1, paramInt2, paramInt3, paramInt4);
    if (this.isCloseAd);
  }

  public void requestAd()
  {
    HashMap localHashMap;
    if (!this.isRequestAd)
    {
      if (!APNUtil.isNetworkAvailable(getContext()))
        break label111;
      localHashMap = new HashMap();
      if (CommonUtil.getSceneOrientation(getContext()) != 2)
        break label106;
    }
    label106: for (int i = 1; ; i = 2)
    {
      localHashMap.put("screen", i);
      localHashMap.put("appid", AppInfoConfig.getAppId());
      this.isRequestAd = true;
      RequestAdCallHandler localRequestAdCallHandler = new RequestAdCallHandler();
      Tencent.getInstance().httpAsynSend(Domain.getQQHallApiEndpoint(), "/v3/mobile/ad/list", "get", localHashMap, localRequestAdCallHandler);
      return;
    }
    label111: Message localMessage = this.mHandler.obtainMessage(104);
    localMessage.arg1 = 0;
    this.mHandler.sendMessage(localMessage);
  }

  public void requestLayout()
  {
    super.requestLayout();
  }

  public void setAdListener(AdListener paramAdListener)
  {
    this.mAdListener = paramAdListener;
  }

  class AdHandler extends Handler
  {
    AdHandler()
    {
    }

    public void handleMessage(Message paramMessage)
    {
      switch (paramMessage.what)
      {
      case 102:
      default:
      case 101:
      case 103:
      case 104:
        int i;
        do
        {
          do
          {
            AdInfo localAdInfo;
            do
            {
              do
                return;
              while (AdView.this.adViewFlipper.getChildCount() <= 1);
              AdView.this.adViewFlipper.showNext();
              removeMessages(101);
              localAdInfo = (AdInfo)AdView.this.adViewFlipper.getCurrentView().getTag();
            }
            while (localAdInfo == null);
            AdView.this.mHandler.sendEmptyMessageDelayed(101, 1000 * localAdInfo.adTime);
            return;
            String str = ReportInfoManager.getInstance().readReportAdInfo(AdView.this.getContext());
            ReportInfoManager.getInstance().changeJSONStr2List(str);
            AdView.this.startShowTime = System.currentTimeMillis();
            AdView.this.showAd();
          }
          while (AdView.this.mAdListener == null);
          AdView.this.mAdListener.onReceiveAdSucceed();
          return;
          i = paramMessage.arg1;
        }
        while (AdView.this.mAdListener == null);
        AdView.this.mAdListener.onReceiveFailed(i);
        return;
      case 105:
        AdView.this.requestAd();
        return;
      case 106:
      }
      AdView.this.showAd();
    }
  }

  class RequestAdCallHandler
    implements SdkCallbackHandler
  {
    public RequestAdCallHandler()
    {
    }

    public void onFailure(SdkCallException paramSdkCallException)
    {
      Message localMessage = AdView.this.mHandler.obtainMessage(104);
      localMessage.arg1 = 2;
      AdView.this.mHandler.sendMessage(localMessage);
    }

    public void onSuccess(String paramString, int paramInt)
    {
      while (true)
      {
        int j;
        try
        {
          JSONArray localJSONArray = new JSONObject(paramString).getJSONArray("entry");
          if ((localJSONArray == null) || (localJSONArray.length() <= 0))
            break label314;
          int i = localJSONArray.length();
          ArrayList localArrayList = AdManager.getInstance().getAdInfoList();
          j = 0;
          if (j >= i)
          {
            if (localArrayList.size() > 0)
              AdView.this.checkAndshowAdContent();
          }
          else
          {
            JSONObject localJSONObject = localJSONArray.getJSONObject(j);
            AdInfo localAdInfo = new AdInfo();
            localAdInfo.id = localJSONObject.optInt("id", 0);
            localAdInfo.picUrl = localJSONObject.optString("picUrl");
            localAdInfo.adUrl = localJSONObject.optString("url");
            localAdInfo.urlType = localJSONObject.optInt("urlType");
            localAdInfo.adTime = localJSONObject.optInt("t");
            if (TextUtils.isEmpty(localAdInfo.picUrl))
              break label348;
            String str = AdInfo.getAdSDCardFilePath(localAdInfo.picUrl);
            if (new File(str).exists())
              localAdInfo.adBitmap = FaceUtil.getRoundedCornerBitmap(BitmapFactory.decodeFile(str), 10.0F);
            AdView.this.addAdToList(localAdInfo);
            if (localAdInfo.adBitmap != null)
              break label348;
            AdView.this.fildDownload.addDownload(localAdInfo.picUrl, str, localAdInfo);
          }
        }
        catch (Exception localException)
        {
          localException.printStackTrace();
          Message localMessage1 = AdView.this.mHandler.obtainMessage(104);
          localMessage1.arg1 = 4;
          AdView.this.mHandler.sendMessage(localMessage1);
          return;
        }
        Message localMessage3 = AdView.this.mHandler.obtainMessage(104);
        localMessage3.arg1 = 5;
        AdView.this.mHandler.sendMessage(localMessage3);
        return;
        label314: Message localMessage2 = AdView.this.mHandler.obtainMessage(104);
        localMessage2.arg1 = 4;
        AdView.this.mHandler.sendMessage(localMessage2);
        return;
        label348: j++;
      }
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.ad.AdView
 * JD-Core Version:    0.6.2
 */