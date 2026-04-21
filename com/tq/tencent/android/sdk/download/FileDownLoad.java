package com.tq.tencent.android.sdk.download;

import java.io.ByteArrayOutputStream;
import java.util.Vector;

public class FileDownLoad
  implements Runnable
{
  private boolean bStop = false;
  ByteArrayOutputStream buff;
  private FileDownLoadListener dListener;
  private int dataBlockLength = 4096;
  private Vector<FDownLoadItem> objArr = new Vector();
  private Thread thread;
  private String userAgent = null;

  public void addDownload(String paramString1, String paramString2, Object paramObject)
  {
    if (paramString1 == null)
      return;
    while (true)
    {
      try
      {
        if (this.objArr != null)
          break label173;
        this.objArr = new Vector();
        break label173;
        if (i >= this.objArr.size())
        {
          FDownLoadItem localFDownLoadItem = new FDownLoadItem(paramString1, paramString2, paramObject);
          this.objArr.add(localFDownLoadItem);
          if ((this.thread == null) || (!this.thread.isAlive()))
          {
            if (this.thread != null)
            {
              this.thread.interrupt();
              this.thread = null;
            }
            this.thread = new Thread(this);
            this.thread.setPriority(1);
            this.thread.start();
          }
          notify();
          break;
        }
      }
      finally
      {
      }
      boolean bool = ((FDownLoadItem)this.objArr.elementAt(i)).filesURL.equals(paramString1);
      if (bool)
        break;
      i++;
      continue;
      label173: int i = 0;
    }
  }

  public int getDownloadCount()
  {
    synchronized (this.objArr)
    {
      if (this.objArr != null)
      {
        int i = this.objArr.size();
        return i;
      }
      return 0;
    }
  }

  public boolean isUrlExist(String paramString)
  {
    if (this.objArr == null)
      this.objArr = new Vector();
    for (int i = 0; ; i++)
    {
      if (i >= this.objArr.size())
        return false;
      if (((FDownLoadItem)this.objArr.elementAt(i)).filesURL.equals(paramString))
        return true;
    }
  }

  // ERROR //
  public void run()
  {
    // Byte code:
    //   0: aload_0
    //   1: getfield 36	com/tq/tencent/android/sdk/download/FileDownLoad:bStop	Z
    //   4: ifeq +4 -> 8
    //   7: return
    //   8: aconst_null
    //   9: astore_1
    //   10: aconst_null
    //   11: astore_2
    //   12: aload_0
    //   13: monitorenter
    //   14: aload_0
    //   15: getfield 34	com/tq/tencent/android/sdk/download/FileDownLoad:objArr	Ljava/util/Vector;
    //   18: invokevirtual 42	java/util/Vector:size	()I
    //   21: ifgt +10 -> 31
    //   24: aload_0
    //   25: getfield 36	com/tq/tencent/android/sdk/download/FileDownLoad:bStop	Z
    //   28: ifeq +71 -> 99
    //   31: aload_0
    //   32: monitorexit
    //   33: aload_0
    //   34: getfield 34	com/tq/tencent/android/sdk/download/FileDownLoad:objArr	Ljava/util/Vector;
    //   37: invokevirtual 42	java/util/Vector:size	()I
    //   40: ifle -33 -> 7
    //   43: aload_0
    //   44: getfield 34	com/tq/tencent/android/sdk/download/FileDownLoad:objArr	Ljava/util/Vector;
    //   47: iconst_0
    //   48: invokevirtual 99	java/util/Vector:get	(I)Ljava/lang/Object;
    //   51: checkcast 44	com/tq/tencent/android/sdk/download/FileDownLoad$FDownLoadItem
    //   54: astore 4
    //   56: aload 4
    //   58: ifnonnull +63 -> 121
    //   61: aload_0
    //   62: getfield 34	com/tq/tencent/android/sdk/download/FileDownLoad:objArr	Ljava/util/Vector;
    //   65: invokevirtual 102	java/util/Vector:isEmpty	()Z
    //   68: ifne +12 -> 80
    //   71: aload_0
    //   72: getfield 34	com/tq/tencent/android/sdk/download/FileDownLoad:objArr	Ljava/util/Vector;
    //   75: iconst_0
    //   76: invokevirtual 105	java/util/Vector:remove	(I)Ljava/lang/Object;
    //   79: pop
    //   80: iconst_0
    //   81: ifeq +7 -> 88
    //   84: aconst_null
    //   85: invokevirtual 110	java/io/FileOutputStream:close	()V
    //   88: iconst_0
    //   89: ifeq -89 -> 0
    //   92: aconst_null
    //   93: invokevirtual 113	java/io/InputStream:close	()V
    //   96: goto -96 -> 0
    //   99: aload_0
    //   100: invokevirtual 116	java/lang/Object:wait	()V
    //   103: goto -89 -> 14
    //   106: astore 35
    //   108: aload 35
    //   110: invokevirtual 119	java/lang/InterruptedException:printStackTrace	()V
    //   113: goto -99 -> 14
    //   116: astore_3
    //   117: aload_0
    //   118: monitorexit
    //   119: aload_3
    //   120: athrow
    //   121: aload 4
    //   123: getfield 81	com/tq/tencent/android/sdk/download/FileDownLoad$FDownLoadItem:filesURL	Ljava/lang/String;
    //   126: astore 10
    //   128: ldc 121
    //   130: new 123	java/lang/StringBuilder
    //   133: dup
    //   134: ldc 125
    //   136: invokespecial 128	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   139: aload 10
    //   141: invokevirtual 132	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   144: invokevirtual 136	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   147: invokestatic 142	com/tq/tencent/android/sdk/common/Logger:debug	(Ljava/lang/String;Ljava/lang/String;)V
    //   150: new 144	java/io/File
    //   153: dup
    //   154: aload 4
    //   156: getfield 147	com/tq/tencent/android/sdk/download/FileDownLoad$FDownLoadItem:filesSavePath	Ljava/lang/String;
    //   159: invokespecial 148	java/io/File:<init>	(Ljava/lang/String;)V
    //   162: astore 11
    //   164: aconst_null
    //   165: astore_2
    //   166: aconst_null
    //   167: astore_1
    //   168: aload 11
    //   170: ifnull +69 -> 239
    //   173: aload 11
    //   175: invokevirtual 152	java/io/File:getParentFile	()Ljava/io/File;
    //   178: astore 12
    //   180: aconst_null
    //   181: astore_2
    //   182: aconst_null
    //   183: astore_1
    //   184: aload 12
    //   186: ifnull +31 -> 217
    //   189: aload 11
    //   191: invokevirtual 152	java/io/File:getParentFile	()Ljava/io/File;
    //   194: invokevirtual 155	java/io/File:exists	()Z
    //   197: istore 13
    //   199: aconst_null
    //   200: astore_2
    //   201: aconst_null
    //   202: astore_1
    //   203: iload 13
    //   205: ifne +12 -> 217
    //   208: aload 11
    //   210: invokevirtual 152	java/io/File:getParentFile	()Ljava/io/File;
    //   213: invokevirtual 158	java/io/File:mkdirs	()Z
    //   216: pop
    //   217: aload 11
    //   219: invokevirtual 155	java/io/File:exists	()Z
    //   222: istore 15
    //   224: aconst_null
    //   225: astore_2
    //   226: aconst_null
    //   227: astore_1
    //   228: iload 15
    //   230: ifne +9 -> 239
    //   233: aload 11
    //   235: invokevirtual 161	java/io/File:createNewFile	()Z
    //   238: pop
    //   239: aload 4
    //   241: getfield 81	com/tq/tencent/android/sdk/download/FileDownLoad$FDownLoadItem:filesURL	Ljava/lang/String;
    //   244: iconst_1
    //   245: iconst_1
    //   246: ldc 162
    //   248: ldc 162
    //   250: aconst_null
    //   251: iconst_1
    //   252: invokestatic 168	com/tq/tencent/android/sdk/download/Http:getHttpConnection	(Ljava/lang/String;ZZIILjava/lang/String;Z)Ljava/net/HttpURLConnection;
    //   255: astore 17
    //   257: aload 17
    //   259: ifnonnull +61 -> 320
    //   262: aload_0
    //   263: getfield 170	com/tq/tencent/android/sdk/download/FileDownLoad:dListener	Lcom/tq/tencent/android/sdk/download/FileDownLoad$FileDownLoadListener;
    //   266: ifnull +16 -> 282
    //   269: aload_0
    //   270: getfield 170	com/tq/tencent/android/sdk/download/FileDownLoad:dListener	Lcom/tq/tencent/android/sdk/download/FileDownLoad$FileDownLoadListener;
    //   273: ldc 172
    //   275: aload 4
    //   277: invokeinterface 178 3 0
    //   282: aload_0
    //   283: getfield 34	com/tq/tencent/android/sdk/download/FileDownLoad:objArr	Ljava/util/Vector;
    //   286: invokevirtual 102	java/util/Vector:isEmpty	()Z
    //   289: ifne +12 -> 301
    //   292: aload_0
    //   293: getfield 34	com/tq/tencent/android/sdk/download/FileDownLoad:objArr	Ljava/util/Vector;
    //   296: iconst_0
    //   297: invokevirtual 105	java/util/Vector:remove	(I)Ljava/lang/Object;
    //   300: pop
    //   301: iconst_0
    //   302: ifeq +7 -> 309
    //   305: aconst_null
    //   306: invokevirtual 110	java/io/FileOutputStream:close	()V
    //   309: iconst_0
    //   310: ifeq -310 -> 0
    //   313: aconst_null
    //   314: invokevirtual 113	java/io/InputStream:close	()V
    //   317: goto -317 -> 0
    //   320: aload 17
    //   322: invokevirtual 183	java/net/HttpURLConnection:getContentLength	()I
    //   325: i2l
    //   326: lstore 20
    //   328: invokestatic 189	com/tq/tencent/android/sdk/common/CommonUtil:getSDCardAvailableCount	()J
    //   331: lload 20
    //   333: lcmp
    //   334: ifge +57 -> 391
    //   337: aload_0
    //   338: getfield 170	com/tq/tencent/android/sdk/download/FileDownLoad:dListener	Lcom/tq/tencent/android/sdk/download/FileDownLoad$FileDownLoadListener;
    //   341: ifnull +16 -> 357
    //   344: aload_0
    //   345: getfield 170	com/tq/tencent/android/sdk/download/FileDownLoad:dListener	Lcom/tq/tencent/android/sdk/download/FileDownLoad$FileDownLoadListener;
    //   348: ldc 191
    //   350: aload 4
    //   352: invokeinterface 178 3 0
    //   357: aload_0
    //   358: getfield 34	com/tq/tencent/android/sdk/download/FileDownLoad:objArr	Ljava/util/Vector;
    //   361: invokevirtual 102	java/util/Vector:isEmpty	()Z
    //   364: ifne +10 -> 374
    //   367: aload_0
    //   368: getfield 34	com/tq/tencent/android/sdk/download/FileDownLoad:objArr	Ljava/util/Vector;
    //   371: invokevirtual 194	java/util/Vector:removeAllElements	()V
    //   374: iconst_0
    //   375: ifeq +7 -> 382
    //   378: aconst_null
    //   379: invokevirtual 110	java/io/FileOutputStream:close	()V
    //   382: iconst_0
    //   383: ifeq -376 -> 7
    //   386: aconst_null
    //   387: invokevirtual 113	java/io/InputStream:close	()V
    //   390: return
    //   391: aload 17
    //   393: invokevirtual 198	java/net/HttpURLConnection:getInputStream	()Ljava/io/InputStream;
    //   396: astore_1
    //   397: new 107	java/io/FileOutputStream
    //   400: dup
    //   401: aload 4
    //   403: getfield 147	com/tq/tencent/android/sdk/download/FileDownLoad$FDownLoadItem:filesSavePath	Ljava/lang/String;
    //   406: invokespecial 199	java/io/FileOutputStream:<init>	(Ljava/lang/String;)V
    //   409: astore 22
    //   411: lconst_0
    //   412: lstore 23
    //   414: aload_0
    //   415: getfield 29	com/tq/tencent/android/sdk/download/FileDownLoad:dataBlockLength	I
    //   418: newarray byte
    //   420: astore 25
    //   422: aload_0
    //   423: getfield 201	com/tq/tencent/android/sdk/download/FileDownLoad:buff	Ljava/io/ByteArrayOutputStream;
    //   426: ifnonnull +81 -> 507
    //   429: aload_0
    //   430: new 203	java/io/ByteArrayOutputStream
    //   433: dup
    //   434: invokespecial 204	java/io/ByteArrayOutputStream:<init>	()V
    //   437: putfield 201	com/tq/tencent/android/sdk/download/FileDownLoad:buff	Ljava/io/ByteArrayOutputStream;
    //   440: aload_0
    //   441: getfield 29	com/tq/tencent/android/sdk/download/FileDownLoad:dataBlockLength	I
    //   444: istore 26
    //   446: aload_1
    //   447: aload 25
    //   449: iconst_0
    //   450: iload 26
    //   452: invokevirtual 208	java/io/InputStream:read	([BII)I
    //   455: istore 27
    //   457: iload 27
    //   459: ifle +18 -> 477
    //   462: lload 23
    //   464: lload 20
    //   466: lcmp
    //   467: ifge +10 -> 477
    //   470: aload_0
    //   471: getfield 36	com/tq/tencent/android/sdk/download/FileDownLoad:bStop	Z
    //   474: ifeq +114 -> 588
    //   477: aload_0
    //   478: getfield 36	com/tq/tencent/android/sdk/download/FileDownLoad:bStop	Z
    //   481: istore 28
    //   483: iload 28
    //   485: ifeq +126 -> 611
    //   488: aload 22
    //   490: ifnull +8 -> 498
    //   493: aload 22
    //   495: invokevirtual 110	java/io/FileOutputStream:close	()V
    //   498: aload_1
    //   499: ifnull -492 -> 7
    //   502: aload_1
    //   503: invokevirtual 113	java/io/InputStream:close	()V
    //   506: return
    //   507: aload_0
    //   508: getfield 201	com/tq/tencent/android/sdk/download/FileDownLoad:buff	Ljava/io/ByteArrayOutputStream;
    //   511: invokevirtual 211	java/io/ByteArrayOutputStream:reset	()V
    //   514: goto -74 -> 440
    //   517: astore 5
    //   519: aload 22
    //   521: astore_2
    //   522: aload 5
    //   524: invokevirtual 212	java/lang/Throwable:printStackTrace	()V
    //   527: aload_0
    //   528: getfield 34	com/tq/tencent/android/sdk/download/FileDownLoad:objArr	Ljava/util/Vector;
    //   531: invokevirtual 102	java/util/Vector:isEmpty	()Z
    //   534: ifne +12 -> 546
    //   537: aload_0
    //   538: getfield 34	com/tq/tencent/android/sdk/download/FileDownLoad:objArr	Ljava/util/Vector;
    //   541: iconst_0
    //   542: invokevirtual 105	java/util/Vector:remove	(I)Ljava/lang/Object;
    //   545: pop
    //   546: aload_0
    //   547: getfield 170	com/tq/tencent/android/sdk/download/FileDownLoad:dListener	Lcom/tq/tencent/android/sdk/download/FileDownLoad$FileDownLoadListener;
    //   550: ifnull +19 -> 569
    //   553: aload_0
    //   554: getfield 170	com/tq/tencent/android/sdk/download/FileDownLoad:dListener	Lcom/tq/tencent/android/sdk/download/FileDownLoad$FileDownLoadListener;
    //   557: aload 5
    //   559: invokevirtual 213	java/lang/Throwable:toString	()Ljava/lang/String;
    //   562: aload 4
    //   564: invokeinterface 178 3 0
    //   569: aload_2
    //   570: ifnull +7 -> 577
    //   573: aload_2
    //   574: invokevirtual 110	java/io/FileOutputStream:close	()V
    //   577: aload_1
    //   578: ifnull -578 -> 0
    //   581: aload_1
    //   582: invokevirtual 113	java/io/InputStream:close	()V
    //   585: goto -585 -> 0
    //   588: aload_0
    //   589: getfield 201	com/tq/tencent/android/sdk/download/FileDownLoad:buff	Ljava/io/ByteArrayOutputStream;
    //   592: aload 25
    //   594: iconst_0
    //   595: iload 27
    //   597: invokevirtual 217	java/io/ByteArrayOutputStream:write	([BII)V
    //   600: lload 23
    //   602: iload 27
    //   604: i2l
    //   605: ladd
    //   606: lstore 23
    //   608: goto -168 -> 440
    //   611: aload 22
    //   613: aload_0
    //   614: getfield 201	com/tq/tencent/android/sdk/download/FileDownLoad:buff	Ljava/io/ByteArrayOutputStream;
    //   617: invokevirtual 221	java/io/ByteArrayOutputStream:toByteArray	()[B
    //   620: invokevirtual 224	java/io/FileOutputStream:write	([B)V
    //   623: aload 22
    //   625: invokevirtual 227	java/io/FileOutputStream:flush	()V
    //   628: aload_0
    //   629: getfield 170	com/tq/tencent/android/sdk/download/FileDownLoad:dListener	Lcom/tq/tencent/android/sdk/download/FileDownLoad$FileDownLoadListener;
    //   632: ifnull +14 -> 646
    //   635: aload_0
    //   636: getfield 170	com/tq/tencent/android/sdk/download/FileDownLoad:dListener	Lcom/tq/tencent/android/sdk/download/FileDownLoad$FileDownLoadListener;
    //   639: aload 4
    //   641: invokeinterface 231 2 0
    //   646: aload_0
    //   647: getfield 34	com/tq/tencent/android/sdk/download/FileDownLoad:objArr	Ljava/util/Vector;
    //   650: invokevirtual 102	java/util/Vector:isEmpty	()Z
    //   653: ifne +12 -> 665
    //   656: aload_0
    //   657: getfield 34	com/tq/tencent/android/sdk/download/FileDownLoad:objArr	Ljava/util/Vector;
    //   660: iconst_0
    //   661: invokevirtual 105	java/util/Vector:remove	(I)Ljava/lang/Object;
    //   664: pop
    //   665: aload 22
    //   667: ifnull +8 -> 675
    //   670: aload 22
    //   672: invokevirtual 110	java/io/FileOutputStream:close	()V
    //   675: aload_1
    //   676: ifnull -676 -> 0
    //   679: aload_1
    //   680: invokevirtual 113	java/io/InputStream:close	()V
    //   683: goto -683 -> 0
    //   686: astore 6
    //   688: aload_2
    //   689: ifnull +7 -> 696
    //   692: aload_2
    //   693: invokevirtual 110	java/io/FileOutputStream:close	()V
    //   696: aload_1
    //   697: ifnull +7 -> 704
    //   700: aload_1
    //   701: invokevirtual 113	java/io/InputStream:close	()V
    //   704: aload 6
    //   706: athrow
    //   707: astore 29
    //   709: goto -709 -> 0
    //   712: astore 7
    //   714: goto -10 -> 704
    //   717: astore 6
    //   719: aload 22
    //   721: astore_2
    //   722: goto -34 -> 688
    //   725: astore 8
    //   727: goto -727 -> 0
    //   730: astore 5
    //   732: aconst_null
    //   733: astore_2
    //   734: goto -212 -> 522
    //   737: astore 31
    //   739: return
    //   740: astore 32
    //   742: return
    //   743: astore 18
    //   745: goto -745 -> 0
    //   748: astore 33
    //   750: goto -750 -> 0
    //
    // Exception table:
    //   from	to	target	type
    //   99	103	106	java/lang/InterruptedException
    //   14	31	116	finally
    //   31	33	116	finally
    //   99	103	116	finally
    //   108	113	116	finally
    //   117	119	116	finally
    //   414	440	517	java/lang/Throwable
    //   440	457	517	java/lang/Throwable
    //   470	477	517	java/lang/Throwable
    //   477	483	517	java/lang/Throwable
    //   507	514	517	java/lang/Throwable
    //   588	600	517	java/lang/Throwable
    //   611	646	517	java/lang/Throwable
    //   646	665	517	java/lang/Throwable
    //   61	80	686	finally
    //   121	164	686	finally
    //   173	180	686	finally
    //   189	199	686	finally
    //   208	217	686	finally
    //   217	224	686	finally
    //   233	239	686	finally
    //   239	257	686	finally
    //   262	282	686	finally
    //   282	301	686	finally
    //   320	357	686	finally
    //   357	374	686	finally
    //   391	411	686	finally
    //   522	546	686	finally
    //   546	569	686	finally
    //   670	675	707	java/lang/Exception
    //   679	683	707	java/lang/Exception
    //   692	696	712	java/lang/Exception
    //   700	704	712	java/lang/Exception
    //   414	440	717	finally
    //   440	457	717	finally
    //   470	477	717	finally
    //   477	483	717	finally
    //   507	514	717	finally
    //   588	600	717	finally
    //   611	646	717	finally
    //   646	665	717	finally
    //   573	577	725	java/lang/Exception
    //   581	585	725	java/lang/Exception
    //   61	80	730	java/lang/Throwable
    //   121	164	730	java/lang/Throwable
    //   173	180	730	java/lang/Throwable
    //   189	199	730	java/lang/Throwable
    //   208	217	730	java/lang/Throwable
    //   217	224	730	java/lang/Throwable
    //   233	239	730	java/lang/Throwable
    //   239	257	730	java/lang/Throwable
    //   262	282	730	java/lang/Throwable
    //   282	301	730	java/lang/Throwable
    //   320	357	730	java/lang/Throwable
    //   357	374	730	java/lang/Throwable
    //   391	411	730	java/lang/Throwable
    //   493	498	737	java/lang/Exception
    //   502	506	737	java/lang/Exception
    //   378	382	740	java/lang/Exception
    //   386	390	740	java/lang/Exception
    //   305	309	743	java/lang/Exception
    //   313	317	743	java/lang/Exception
    //   84	88	748	java/lang/Exception
    //   92	96	748	java/lang/Exception
  }

  public void setDownLoadListener(FileDownLoadListener paramFileDownLoadListener)
  {
    this.dListener = paramFileDownLoadListener;
  }

  void setUA(String paramString)
  {
    this.userAgent = paramString;
  }

  public void stop()
  {
    try
    {
      this.bStop = true;
      notify();
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public static class FDownLoadItem
  {
    public String filesSavePath;
    public String filesURL;
    public Object listenObject;

    public FDownLoadItem(String paramString1, String paramString2, Object paramObject)
    {
      this.filesURL = paramString1;
      this.listenObject = paramObject;
      this.filesSavePath = paramString2;
    }
  }

  public static abstract interface FileDownLoadListener
  {
    public abstract void fileDownloadError(String paramString, FileDownLoad.FDownLoadItem paramFDownLoadItem);

    public abstract void fileDownloadFinnish(FileDownLoad.FDownLoadItem paramFDownLoadItem);

    public abstract void fileDownloadStart(long paramLong, FileDownLoad.FDownLoadItem paramFDownLoadItem);

    public abstract void fileDownloadUpdate(long paramLong1, long paramLong2, FileDownLoad.FDownLoadItem paramFDownLoadItem);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.tq.tencent.android.sdk.download.FileDownLoad
 * JD-Core Version:    0.6.2
 */