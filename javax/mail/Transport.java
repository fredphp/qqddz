package javax.mail;

import java.util.Vector;
import javax.mail.event.TransportEvent;
import javax.mail.event.TransportListener;

public abstract class Transport extends Service
{
  private Vector transportListeners = null;

  public Transport(Session paramSession, URLName paramURLName)
  {
    super(paramSession, paramURLName);
  }

  public static void send(Message paramMessage)
    throws MessagingException
  {
    paramMessage.saveChanges();
    send0(paramMessage, paramMessage.getAllRecipients());
  }

  public static void send(Message paramMessage, Address[] paramArrayOfAddress)
    throws MessagingException
  {
    paramMessage.saveChanges();
    send0(paramMessage, paramArrayOfAddress);
  }

  // ERROR //
  private static void send0(Message paramMessage, Address[] paramArrayOfAddress)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_1
    //   1: ifnull +8 -> 9
    //   4: aload_1
    //   5: arraylength
    //   6: ifne +13 -> 19
    //   9: new 32	javax/mail/SendFailedException
    //   12: dup
    //   13: ldc 34
    //   15: invokespecial 37	javax/mail/SendFailedException:<init>	(Ljava/lang/String;)V
    //   18: athrow
    //   19: new 39	java/util/Hashtable
    //   22: dup
    //   23: invokespecial 41	java/util/Hashtable:<init>	()V
    //   26: astore_2
    //   27: new 43	java/util/Vector
    //   30: dup
    //   31: invokespecial 44	java/util/Vector:<init>	()V
    //   34: astore_3
    //   35: new 43	java/util/Vector
    //   38: dup
    //   39: invokespecial 44	java/util/Vector:<init>	()V
    //   42: astore 4
    //   44: new 43	java/util/Vector
    //   47: dup
    //   48: invokespecial 44	java/util/Vector:<init>	()V
    //   51: astore 5
    //   53: iconst_0
    //   54: istore 6
    //   56: iload 6
    //   58: aload_1
    //   59: arraylength
    //   60: if_icmplt +24 -> 84
    //   63: aload_2
    //   64: invokevirtual 48	java/util/Hashtable:size	()I
    //   67: istore 9
    //   69: iload 9
    //   71: ifne +89 -> 160
    //   74: new 32	javax/mail/SendFailedException
    //   77: dup
    //   78: ldc 34
    //   80: invokespecial 37	javax/mail/SendFailedException:<init>	(Ljava/lang/String;)V
    //   83: athrow
    //   84: aload_2
    //   85: aload_1
    //   86: iload 6
    //   88: aaload
    //   89: invokevirtual 54	javax/mail/Address:getType	()Ljava/lang/String;
    //   92: invokevirtual 58	java/util/Hashtable:containsKey	(Ljava/lang/Object;)Z
    //   95: ifeq +30 -> 125
    //   98: aload_2
    //   99: aload_1
    //   100: iload 6
    //   102: aaload
    //   103: invokevirtual 54	javax/mail/Address:getType	()Ljava/lang/String;
    //   106: invokevirtual 62	java/util/Hashtable:get	(Ljava/lang/Object;)Ljava/lang/Object;
    //   109: checkcast 43	java/util/Vector
    //   112: aload_1
    //   113: iload 6
    //   115: aaload
    //   116: invokevirtual 66	java/util/Vector:addElement	(Ljava/lang/Object;)V
    //   119: iinc 6 1
    //   122: goto -66 -> 56
    //   125: new 43	java/util/Vector
    //   128: dup
    //   129: invokespecial 44	java/util/Vector:<init>	()V
    //   132: astore 7
    //   134: aload 7
    //   136: aload_1
    //   137: iload 6
    //   139: aaload
    //   140: invokevirtual 66	java/util/Vector:addElement	(Ljava/lang/Object;)V
    //   143: aload_2
    //   144: aload_1
    //   145: iload 6
    //   147: aaload
    //   148: invokevirtual 54	javax/mail/Address:getType	()Ljava/lang/String;
    //   151: aload 7
    //   153: invokevirtual 70	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   156: pop
    //   157: goto -38 -> 119
    //   160: aload_0
    //   161: getfield 74	javax/mail/Message:session	Ljavax/mail/Session;
    //   164: ifnull +47 -> 211
    //   167: aload_0
    //   168: getfield 74	javax/mail/Message:session	Ljavax/mail/Session;
    //   171: astore 10
    //   173: iload 9
    //   175: iconst_1
    //   176: if_icmpne +57 -> 233
    //   179: aload_1
    //   180: iconst_0
    //   181: aaload
    //   182: astore 34
    //   184: aload 10
    //   186: aload 34
    //   188: invokevirtual 80	javax/mail/Session:getTransport	(Ljavax/mail/Address;)Ljavax/mail/Transport;
    //   191: astore 35
    //   193: aload 35
    //   195: invokevirtual 83	javax/mail/Transport:connect	()V
    //   198: aload 35
    //   200: aload_0
    //   201: aload_1
    //   202: invokevirtual 86	javax/mail/Transport:sendMessage	(Ljavax/mail/Message;[Ljavax/mail/Address;)V
    //   205: aload 35
    //   207: invokevirtual 89	javax/mail/Transport:close	()V
    //   210: return
    //   211: invokestatic 95	java/lang/System:getProperties	()Ljava/util/Properties;
    //   214: aconst_null
    //   215: invokestatic 99	javax/mail/Session:getDefaultInstance	(Ljava/util/Properties;Ljavax/mail/Authenticator;)Ljavax/mail/Session;
    //   218: astore 10
    //   220: goto -47 -> 173
    //   223: astore 36
    //   225: aload 35
    //   227: invokevirtual 89	javax/mail/Transport:close	()V
    //   230: aload 36
    //   232: athrow
    //   233: aconst_null
    //   234: astore 11
    //   236: iconst_0
    //   237: istore 12
    //   239: aload_2
    //   240: invokevirtual 103	java/util/Hashtable:elements	()Ljava/util/Enumeration;
    //   243: astore 13
    //   245: aload 13
    //   247: invokeinterface 109 1 0
    //   252: ifne +131 -> 383
    //   255: iload 12
    //   257: ifne +18 -> 275
    //   260: aload_3
    //   261: invokevirtual 110	java/util/Vector:size	()I
    //   264: ifne +11 -> 275
    //   267: aload 5
    //   269: invokevirtual 110	java/util/Vector:size	()I
    //   272: ifeq -62 -> 210
    //   275: aconst_null
    //   276: checkcast 112	[Ljavax/mail/Address;
    //   279: astore 31
    //   281: aconst_null
    //   282: checkcast 112	[Ljavax/mail/Address;
    //   285: astore 32
    //   287: aconst_null
    //   288: checkcast 112	[Ljavax/mail/Address;
    //   291: astore 33
    //   293: aload 4
    //   295: invokevirtual 110	java/util/Vector:size	()I
    //   298: ifle +20 -> 318
    //   301: aload 4
    //   303: invokevirtual 110	java/util/Vector:size	()I
    //   306: anewarray 50	javax/mail/Address
    //   309: astore 31
    //   311: aload 4
    //   313: aload 31
    //   315: invokevirtual 116	java/util/Vector:copyInto	([Ljava/lang/Object;)V
    //   318: aload 5
    //   320: invokevirtual 110	java/util/Vector:size	()I
    //   323: ifle +20 -> 343
    //   326: aload 5
    //   328: invokevirtual 110	java/util/Vector:size	()I
    //   331: anewarray 50	javax/mail/Address
    //   334: astore 32
    //   336: aload 5
    //   338: aload 32
    //   340: invokevirtual 116	java/util/Vector:copyInto	([Ljava/lang/Object;)V
    //   343: aload_3
    //   344: invokevirtual 110	java/util/Vector:size	()I
    //   347: ifle +18 -> 365
    //   350: aload_3
    //   351: invokevirtual 110	java/util/Vector:size	()I
    //   354: anewarray 50	javax/mail/Address
    //   357: astore 33
    //   359: aload_3
    //   360: aload 33
    //   362: invokevirtual 116	java/util/Vector:copyInto	([Ljava/lang/Object;)V
    //   365: new 32	javax/mail/SendFailedException
    //   368: dup
    //   369: ldc 118
    //   371: aload 11
    //   373: aload 31
    //   375: aload 32
    //   377: aload 33
    //   379: invokespecial 121	javax/mail/SendFailedException:<init>	(Ljava/lang/String;Ljava/lang/Exception;[Ljavax/mail/Address;[Ljavax/mail/Address;[Ljavax/mail/Address;)V
    //   382: athrow
    //   383: aload 13
    //   385: invokeinterface 125 1 0
    //   390: checkcast 43	java/util/Vector
    //   393: astore 14
    //   395: aload 14
    //   397: invokevirtual 110	java/util/Vector:size	()I
    //   400: anewarray 50	javax/mail/Address
    //   403: astore 15
    //   405: aload 14
    //   407: aload 15
    //   409: invokevirtual 116	java/util/Vector:copyInto	([Ljava/lang/Object;)V
    //   412: aload 15
    //   414: iconst_0
    //   415: aaload
    //   416: astore 16
    //   418: aload 10
    //   420: aload 16
    //   422: invokevirtual 80	javax/mail/Session:getTransport	(Ljavax/mail/Address;)Ljavax/mail/Transport;
    //   425: astore 17
    //   427: aload 17
    //   429: ifnonnull +29 -> 458
    //   432: iconst_0
    //   433: istore 30
    //   435: iload 30
    //   437: aload 15
    //   439: arraylength
    //   440: if_icmpge -195 -> 245
    //   443: aload_3
    //   444: aload 15
    //   446: iload 30
    //   448: aaload
    //   449: invokevirtual 66	java/util/Vector:addElement	(Ljava/lang/Object;)V
    //   452: iinc 30 1
    //   455: goto -20 -> 435
    //   458: aload 17
    //   460: invokevirtual 83	javax/mail/Transport:connect	()V
    //   463: aload 17
    //   465: aload_0
    //   466: aload 15
    //   468: invokevirtual 86	javax/mail/Transport:sendMessage	(Ljavax/mail/Message;[Ljavax/mail/Address;)V
    //   471: aload 17
    //   473: invokevirtual 89	javax/mail/Transport:close	()V
    //   476: goto -231 -> 245
    //   479: astore 21
    //   481: iconst_1
    //   482: istore 12
    //   484: aload 11
    //   486: ifnonnull +88 -> 574
    //   489: aload 21
    //   491: astore 11
    //   493: aload 21
    //   495: invokevirtual 128	javax/mail/SendFailedException:getInvalidAddresses	()[Ljavax/mail/Address;
    //   498: astore 23
    //   500: aload 23
    //   502: ifnull +14 -> 516
    //   505: iconst_0
    //   506: istore 29
    //   508: iload 29
    //   510: aload 23
    //   512: arraylength
    //   513: if_icmplt +82 -> 595
    //   516: aload 21
    //   518: invokevirtual 131	javax/mail/SendFailedException:getValidSentAddresses	()[Ljavax/mail/Address;
    //   521: astore 24
    //   523: aload 24
    //   525: ifnull +14 -> 539
    //   528: iconst_0
    //   529: istore 28
    //   531: iload 28
    //   533: aload 24
    //   535: arraylength
    //   536: if_icmplt +74 -> 610
    //   539: aload 21
    //   541: invokevirtual 134	javax/mail/SendFailedException:getValidUnsentAddresses	()[Ljavax/mail/Address;
    //   544: astore 25
    //   546: aload 25
    //   548: ifnull +18 -> 566
    //   551: iconst_0
    //   552: istore 26
    //   554: aload 25
    //   556: arraylength
    //   557: istore 27
    //   559: iload 26
    //   561: iload 27
    //   563: if_icmplt +63 -> 626
    //   566: aload 17
    //   568: invokevirtual 89	javax/mail/Transport:close	()V
    //   571: goto -326 -> 245
    //   574: aload 11
    //   576: aload 21
    //   578: invokevirtual 138	javax/mail/MessagingException:setNextException	(Ljava/lang/Exception;)Z
    //   581: pop
    //   582: goto -89 -> 493
    //   585: astore 20
    //   587: aload 17
    //   589: invokevirtual 89	javax/mail/Transport:close	()V
    //   592: aload 20
    //   594: athrow
    //   595: aload_3
    //   596: aload 23
    //   598: iload 29
    //   600: aaload
    //   601: invokevirtual 66	java/util/Vector:addElement	(Ljava/lang/Object;)V
    //   604: iinc 29 1
    //   607: goto -99 -> 508
    //   610: aload 4
    //   612: aload 24
    //   614: iload 28
    //   616: aaload
    //   617: invokevirtual 66	java/util/Vector:addElement	(Ljava/lang/Object;)V
    //   620: iinc 28 1
    //   623: goto -92 -> 531
    //   626: aload 5
    //   628: aload 25
    //   630: iload 26
    //   632: aaload
    //   633: invokevirtual 66	java/util/Vector:addElement	(Ljava/lang/Object;)V
    //   636: iinc 26 1
    //   639: goto -85 -> 554
    //   642: astore 18
    //   644: iconst_1
    //   645: istore 12
    //   647: aload 11
    //   649: ifnonnull +15 -> 664
    //   652: aload 18
    //   654: astore 11
    //   656: aload 17
    //   658: invokevirtual 89	javax/mail/Transport:close	()V
    //   661: goto -416 -> 245
    //   664: aload 11
    //   666: aload 18
    //   668: invokevirtual 138	javax/mail/MessagingException:setNextException	(Ljava/lang/Exception;)Z
    //   671: pop
    //   672: goto -16 -> 656
    //
    // Exception table:
    //   from	to	target	type
    //   193	205	223	finally
    //   458	471	479	javax/mail/SendFailedException
    //   458	471	585	finally
    //   493	500	585	finally
    //   508	516	585	finally
    //   516	523	585	finally
    //   531	539	585	finally
    //   539	546	585	finally
    //   554	559	585	finally
    //   574	582	585	finally
    //   595	604	585	finally
    //   610	620	585	finally
    //   626	636	585	finally
    //   664	672	585	finally
    //   458	471	642	javax/mail/MessagingException
  }

  public void addTransportListener(TransportListener paramTransportListener)
  {
    try
    {
      if (this.transportListeners == null)
        this.transportListeners = new Vector();
      this.transportListeners.addElement(paramTransportListener);
      return;
    }
    finally
    {
    }
  }

  protected void notifyTransportListeners(int paramInt, Address[] paramArrayOfAddress1, Address[] paramArrayOfAddress2, Address[] paramArrayOfAddress3, Message paramMessage)
  {
    if (this.transportListeners == null)
      return;
    queueEvent(new TransportEvent(this, paramInt, paramArrayOfAddress1, paramArrayOfAddress2, paramArrayOfAddress3, paramMessage), this.transportListeners);
  }

  public void removeTransportListener(TransportListener paramTransportListener)
  {
    try
    {
      if (this.transportListeners != null)
        this.transportListeners.removeElement(paramTransportListener);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public abstract void sendMessage(Message paramMessage, Address[] paramArrayOfAddress)
    throws MessagingException;
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.Transport
 * JD-Core Version:    0.6.2
 */