package javax.activation;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.net.URL;
import myjava.awt.datatransfer.DataFlavor;
import myjava.awt.datatransfer.Transferable;
import myjava.awt.datatransfer.UnsupportedFlavorException;

public class DataHandler
  implements Transferable
{
  private static final DataFlavor[] emptyFlavors = new DataFlavor[0];
  private static DataContentHandlerFactory factory = null;
  private CommandMap currentCommandMap = null;
  private DataContentHandler dataContentHandler = null;
  private DataSource dataSource = null;
  private DataContentHandler factoryDCH = null;
  private DataSource objDataSource = null;
  private Object object = null;
  private String objectMimeType = null;
  private DataContentHandlerFactory oldFactory = null;
  private String shortType = null;
  private DataFlavor[] transferFlavors = emptyFlavors;

  public DataHandler(Object paramObject, String paramString)
  {
    this.object = paramObject;
    this.objectMimeType = paramString;
    this.oldFactory = factory;
  }

  public DataHandler(URL paramURL)
  {
    this.dataSource = new URLDataSource(paramURL);
    this.oldFactory = factory;
  }

  public DataHandler(DataSource paramDataSource)
  {
    this.dataSource = paramDataSource;
    this.oldFactory = factory;
  }

  private String getBaseType()
  {
    try
    {
      String str2;
      if (this.shortType == null)
        str2 = getContentType();
      try
      {
        this.shortType = new MimeType(str2).getBaseType();
        String str1 = this.shortType;
        return str1;
      }
      catch (MimeTypeParseException localMimeTypeParseException)
      {
        while (true)
          this.shortType = str2;
      }
    }
    finally
    {
    }
  }

  private CommandMap getCommandMap()
  {
    try
    {
      if (this.currentCommandMap != null);
      CommandMap localCommandMap;
      for (Object localObject2 = this.currentCommandMap; ; localObject2 = localCommandMap)
      {
        return localObject2;
        localCommandMap = CommandMap.getDefaultCommandMap();
      }
    }
    finally
    {
    }
  }

  private DataContentHandler getDataContentHandler()
  {
    while (true)
    {
      try
      {
        if (factory != this.oldFactory)
        {
          this.oldFactory = factory;
          this.factoryDCH = null;
          this.dataContentHandler = null;
          this.transferFlavors = emptyFlavors;
        }
        DataContentHandler localDataContentHandler;
        if (this.dataContentHandler != null)
        {
          localDataContentHandler = this.dataContentHandler;
          return localDataContentHandler;
        }
        String str = getBaseType();
        if ((this.factoryDCH == null) && (factory != null))
          this.factoryDCH = factory.createDataContentHandler(str);
        if (this.factoryDCH != null)
          this.dataContentHandler = this.factoryDCH;
        if (this.dataContentHandler == null)
        {
          if (this.dataSource != null)
            this.dataContentHandler = getCommandMap().createDataContentHandler(str, this.dataSource);
        }
        else
        {
          if (this.dataSource == null)
            break label182;
          this.dataContentHandler = new DataSourceDataContentHandler(this.dataContentHandler, this.dataSource);
          localDataContentHandler = this.dataContentHandler;
          continue;
        }
        this.dataContentHandler = getCommandMap().createDataContentHandler(str);
        continue;
      }
      finally
      {
      }
      label182: this.dataContentHandler = new ObjectDataContentHandler(this.dataContentHandler, this.object, this.objectMimeType);
    }
  }

  public static void setDataContentHandlerFactory(DataContentHandlerFactory paramDataContentHandlerFactory)
  {
    try
    {
      if (factory != null)
        throw new Error("DataContentHandlerFactory already defined");
    }
    finally
    {
    }
    SecurityManager localSecurityManager = System.getSecurityManager();
    if (localSecurityManager != null);
    try
    {
      localSecurityManager.checkSetFactory();
      factory = paramDataContentHandlerFactory;
      return;
    }
    catch (SecurityException localSecurityException)
    {
      while (DataHandler.class.getClassLoader() == paramDataContentHandlerFactory.getClass().getClassLoader());
      throw localSecurityException;
    }
  }

  public CommandInfo[] getAllCommands()
  {
    if (this.dataSource != null)
      return getCommandMap().getAllCommands(getBaseType(), this.dataSource);
    return getCommandMap().getAllCommands(getBaseType());
  }

  public Object getBean(CommandInfo paramCommandInfo)
  {
    try
    {
      ClassLoader localClassLoader = SecuritySupport.getContextClassLoader();
      if (localClassLoader == null)
        localClassLoader = getClass().getClassLoader();
      Object localObject = paramCommandInfo.getCommandObject(this, localClassLoader);
      return localObject;
    }
    catch (ClassNotFoundException localClassNotFoundException)
    {
      return null;
    }
    catch (IOException localIOException)
    {
    }
    return null;
  }

  public CommandInfo getCommand(String paramString)
  {
    if (this.dataSource != null)
      return getCommandMap().getCommand(getBaseType(), paramString, this.dataSource);
    return getCommandMap().getCommand(getBaseType(), paramString);
  }

  public Object getContent()
    throws IOException
  {
    if (this.object != null)
      return this.object;
    return getDataContentHandler().getContent(getDataSource());
  }

  public String getContentType()
  {
    if (this.dataSource != null)
      return this.dataSource.getContentType();
    return this.objectMimeType;
  }

  public DataSource getDataSource()
  {
    if (this.dataSource == null)
    {
      if (this.objDataSource == null)
        this.objDataSource = new DataHandlerDataSource(this);
      return this.objDataSource;
    }
    return this.dataSource;
  }

  public InputStream getInputStream()
    throws IOException
  {
    if (this.dataSource != null)
      return this.dataSource.getInputStream();
    final DataContentHandler localDataContentHandler = getDataContentHandler();
    if (localDataContentHandler == null)
      throw new UnsupportedDataTypeException("no DCH for MIME type " + getBaseType());
    if (((localDataContentHandler instanceof ObjectDataContentHandler)) && (((ObjectDataContentHandler)localDataContentHandler).getDCH() == null))
      throw new UnsupportedDataTypeException("no object DCH for MIME type " + getBaseType());
    final PipedOutputStream localPipedOutputStream = new PipedOutputStream();
    PipedInputStream localPipedInputStream = new PipedInputStream(localPipedOutputStream);
    new Thread(new Runnable()
    {
      // ERROR //
      public void run()
      {
        // Byte code:
        //   0: aload_0
        //   1: getfield 25	javax/activation/DataHandler$1:val$fdch	Ljavax/activation/DataContentHandler;
        //   4: aload_0
        //   5: getfield 21	javax/activation/DataHandler$1:this$0	Ljavax/activation/DataHandler;
        //   8: invokestatic 35	javax/activation/DataHandler:access$0	(Ljavax/activation/DataHandler;)Ljava/lang/Object;
        //   11: aload_0
        //   12: getfield 21	javax/activation/DataHandler$1:this$0	Ljavax/activation/DataHandler;
        //   15: invokestatic 39	javax/activation/DataHandler:access$1	(Ljavax/activation/DataHandler;)Ljava/lang/String;
        //   18: aload_0
        //   19: getfield 23	javax/activation/DataHandler$1:val$pos	Ljava/io/PipedOutputStream;
        //   22: invokeinterface 45 4 0
        //   27: aload_0
        //   28: getfield 23	javax/activation/DataHandler$1:val$pos	Ljava/io/PipedOutputStream;
        //   31: invokevirtual 50	java/io/PipedOutputStream:close	()V
        //   34: return
        //   35: astore_3
        //   36: aload_0
        //   37: getfield 23	javax/activation/DataHandler$1:val$pos	Ljava/io/PipedOutputStream;
        //   40: invokevirtual 50	java/io/PipedOutputStream:close	()V
        //   43: return
        //   44: astore 4
        //   46: return
        //   47: astore_1
        //   48: aload_0
        //   49: getfield 23	javax/activation/DataHandler$1:val$pos	Ljava/io/PipedOutputStream;
        //   52: invokevirtual 50	java/io/PipedOutputStream:close	()V
        //   55: aload_1
        //   56: athrow
        //   57: astore 5
        //   59: return
        //   60: astore_2
        //   61: goto -6 -> 55
        //
        // Exception table:
        //   from	to	target	type
        //   0	27	35	java/io/IOException
        //   36	43	44	java/io/IOException
        //   0	27	47	finally
        //   27	34	57	java/io/IOException
        //   48	55	60	java/io/IOException
      }
    }
    , "DataHandler.getInputStream").start();
    return localPipedInputStream;
  }

  public String getName()
  {
    if (this.dataSource != null)
      return this.dataSource.getName();
    return null;
  }

  public OutputStream getOutputStream()
    throws IOException
  {
    if (this.dataSource != null)
      return this.dataSource.getOutputStream();
    return null;
  }

  public CommandInfo[] getPreferredCommands()
  {
    if (this.dataSource != null)
      return getCommandMap().getPreferredCommands(getBaseType(), this.dataSource);
    return getCommandMap().getPreferredCommands(getBaseType());
  }

  public Object getTransferData(DataFlavor paramDataFlavor)
    throws UnsupportedFlavorException, IOException
  {
    return getDataContentHandler().getTransferData(paramDataFlavor, this.dataSource);
  }

  public DataFlavor[] getTransferDataFlavors()
  {
    try
    {
      if (factory != this.oldFactory)
        this.transferFlavors = emptyFlavors;
      if (this.transferFlavors == emptyFlavors)
        this.transferFlavors = getDataContentHandler().getTransferDataFlavors();
      DataFlavor[] arrayOfDataFlavor = this.transferFlavors;
      return arrayOfDataFlavor;
    }
    finally
    {
    }
  }

  public boolean isDataFlavorSupported(DataFlavor paramDataFlavor)
  {
    DataFlavor[] arrayOfDataFlavor = getTransferDataFlavors();
    for (int i = 0; ; i++)
    {
      if (i >= arrayOfDataFlavor.length)
        return false;
      if (arrayOfDataFlavor[i].equals(paramDataFlavor))
        return true;
    }
  }

  public void setCommandMap(CommandMap paramCommandMap)
  {
    try
    {
      if ((paramCommandMap != this.currentCommandMap) || (paramCommandMap == null))
      {
        this.transferFlavors = emptyFlavors;
        this.dataContentHandler = null;
        this.currentCommandMap = paramCommandMap;
      }
      return;
    }
    finally
    {
    }
  }

  public void writeTo(OutputStream paramOutputStream)
    throws IOException
  {
    if (this.dataSource != null)
    {
      byte[] arrayOfByte = new byte[8192];
      InputStream localInputStream = this.dataSource.getInputStream();
      try
      {
        while (true)
        {
          int i = localInputStream.read(arrayOfByte);
          if (i <= 0)
            return;
          paramOutputStream.write(arrayOfByte, 0, i);
        }
      }
      finally
      {
        localInputStream.close();
      }
    }
    getDataContentHandler().writeTo(this.object, this.objectMimeType, paramOutputStream);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.activation.DataHandler
 * JD-Core Version:    0.6.2
 */