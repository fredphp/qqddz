package com.tq.tencent.android.sdk.common;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.text.TextUtils;
import com.tq.tencent.android.sdk.Tencent;
import java.util.ArrayList;
import java.util.Iterator;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ReportInfoManager
{
  private static ReportInfoManager instance;
  private ArrayList<ReportInfo> reportAdInfoList = new ArrayList();

  public static ReportInfoManager getInstance()
  {
    if (instance == null)
      instance = new ReportInfoManager();
    return instance;
  }

  private void saveReportAdInfo(Context paramContext)
  {
    SharedPreferences.Editor localEditor = paramContext.getSharedPreferences("tq_sdk_prefname", 0).edit();
    localEditor.putString("pref_report_ad_info", changeList2JSONStr());
    localEditor.commit();
  }

  public void addReportAdInfo(int paramInt1, String paramString, int paramInt2)
  {
    Iterator localIterator = this.reportAdInfoList.iterator();
    ReportInfo localReportInfo2;
    do
    {
      if (!localIterator.hasNext())
      {
        ReportInfo localReportInfo1 = new ReportInfo();
        localReportInfo1.adId = paramInt1;
        localReportInfo1.adReport = paramString;
        localReportInfo1.adData = paramInt2;
        this.reportAdInfoList.add(localReportInfo1);
        saveReportAdInfo(Tencent.getContext());
        return;
      }
      localReportInfo2 = (ReportInfo)localIterator.next();
    }
    while ((localReportInfo2.adId != paramInt1) || (!localReportInfo2.adReport.equals(paramString)));
    localReportInfo2.adData = (paramInt2 + localReportInfo2.adData);
    saveReportAdInfo(Tencent.getContext());
  }

  public void changeJSONStr2List(String paramString)
  {
    if (!TextUtils.isEmpty(paramString))
      this.reportAdInfoList.clear();
    try
    {
      JSONArray localJSONArray = new JSONArray(paramString);
      int i = localJSONArray.length();
      int j = 0;
      while (true)
      {
        if (j >= i)
          return;
        try
        {
          JSONObject localJSONObject = localJSONArray.getJSONObject(j);
          ReportInfo localReportInfo = new ReportInfo();
          localReportInfo.adId = localJSONObject.getInt("id");
          localReportInfo.adReport = localJSONObject.getString("report");
          localReportInfo.adData = localJSONObject.getInt("data");
          this.reportAdInfoList.add(localReportInfo);
          j++;
        }
        catch (JSONException localJSONException2)
        {
          while (true)
            localJSONException2.printStackTrace();
        }
      }
    }
    catch (JSONException localJSONException1)
    {
      localJSONException1.printStackTrace();
    }
  }

  public String changeList2JSONStr()
  {
    if (this.reportAdInfoList.size() <= 0)
      return "";
    JSONArray localJSONArray = new JSONArray();
    Iterator localIterator = this.reportAdInfoList.iterator();
    while (true)
    {
      if (!localIterator.hasNext())
        return localJSONArray.toString();
      ReportInfo localReportInfo = (ReportInfo)localIterator.next();
      try
      {
        JSONObject localJSONObject = new JSONObject();
        localJSONObject.put("id", localReportInfo.adId);
        localJSONObject.put("report", localReportInfo.adReport);
        localJSONObject.put("data", localReportInfo.adData);
        localJSONArray.put(localJSONObject);
      }
      catch (JSONException localJSONException)
      {
        localJSONException.printStackTrace();
      }
    }
  }

  public void clearReportAdInfo(Context paramContext)
  {
    SharedPreferences.Editor localEditor = paramContext.getSharedPreferences("tq_sdk_prefname", 0).edit();
    localEditor.putString("pref_report_ad_info", "");
    localEditor.commit();
    this.reportAdInfoList.clear();
  }

  public String readReportAdInfo(Context paramContext)
  {
    return paramContext.getSharedPreferences("tq_sdk_prefname", 0).getString("pref_report_ad_info", "");
  }

  static class ReportInfo
  {
    public int adData;
    public int adId;
    public String adReport;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.common.ReportInfoManager
 * JD-Core Version:    0.6.2
 */