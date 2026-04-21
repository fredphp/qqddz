package com.tq.tencent.android.sdk.common;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class OpSdkParams
{
  private List<String> mKeys = new ArrayList();
  private Map<String, String> mParameters = new HashMap();

  public void add(String paramString1, String paramString2)
  {
    if (this.mKeys.contains(paramString1))
    {
      this.mParameters.put(paramString1, paramString2);
      return;
    }
    this.mKeys.add(paramString1);
    this.mParameters.put(paramString1, paramString2);
  }

  public void clear()
  {
    this.mKeys.clear();
    this.mParameters.clear();
  }

  public String getKey(int paramInt)
  {
    if ((paramInt >= 0) && (paramInt < this.mKeys.size()))
      return (String)this.mKeys.get(paramInt);
    return "";
  }

  public String getValue(int paramInt)
  {
    String str = (String)this.mKeys.get(paramInt);
    return (String)this.mParameters.get(str);
  }

  public String getValue(String paramString)
  {
    return (String)this.mParameters.get(paramString);
  }

  public void remove(String paramString)
  {
    this.mKeys.remove(paramString);
    this.mParameters.remove(paramString);
  }

  public int size()
  {
    return this.mKeys.size();
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.common.OpSdkParams
 * JD-Core Version:    0.6.2
 */