package org.apache.harmony.awt.datatransfer;

import java.awt.Graphics;
import java.awt.Image;
import java.awt.datatransfer.DataFlavor;
import java.awt.datatransfer.SystemFlavorMap;
import java.awt.datatransfer.Transferable;
import java.awt.image.BufferedImage;
import java.awt.image.DataBufferInt;
import java.awt.image.WritableRaster;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.Reader;
import java.io.Serializable;
import java.net.URL;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class DataSource
  implements DataProvider
{
  protected final Transferable contents;
  private DataFlavor[] flavors;
  private List<String> nativeFormats;

  public DataSource(Transferable paramTransferable)
  {
    this.contents = paramTransferable;
  }

  private RawBitmap getImageBitmap(Image paramImage)
  {
    RawBitmap localRawBitmap;
    if ((paramImage instanceof BufferedImage))
    {
      BufferedImage localBufferedImage2 = (BufferedImage)paramImage;
      if (localBufferedImage2.getType() == 1)
        localRawBitmap = getImageBitmap32(localBufferedImage2);
    }
    int i;
    int j;
    do
    {
      do
      {
        return localRawBitmap;
        i = paramImage.getWidth(null);
        j = paramImage.getHeight(null);
        localRawBitmap = null;
      }
      while (i <= 0);
      localRawBitmap = null;
    }
    while (j <= 0);
    BufferedImage localBufferedImage1 = new BufferedImage(i, j, 1);
    Graphics localGraphics = localBufferedImage1.getGraphics();
    localGraphics.drawImage(paramImage, 0, 0, null);
    localGraphics.dispose();
    return getImageBitmap32(localBufferedImage1);
  }

  private RawBitmap getImageBitmap32(BufferedImage paramBufferedImage)
  {
    int[] arrayOfInt1 = new int[paramBufferedImage.getWidth() * paramBufferedImage.getHeight()];
    DataBufferInt localDataBufferInt = (DataBufferInt)paramBufferedImage.getRaster().getDataBuffer();
    int i = 0;
    int j = localDataBufferInt.getNumBanks();
    int[] arrayOfInt2 = localDataBufferInt.getOffsets();
    for (int k = 0; ; k++)
    {
      if (k >= j)
        return new RawBitmap(paramBufferedImage.getWidth(), paramBufferedImage.getHeight(), paramBufferedImage.getWidth(), 32, 16711680, 65280, 255, arrayOfInt1);
      int[] arrayOfInt3 = localDataBufferInt.getData(k);
      System.arraycopy(arrayOfInt3, arrayOfInt2[k], arrayOfInt1, i, arrayOfInt3.length - arrayOfInt2[k]);
      i += arrayOfInt3.length - arrayOfInt2[k];
    }
  }

  private static List<String> getNativesForFlavors(DataFlavor[] paramArrayOfDataFlavor)
  {
    ArrayList localArrayList = new ArrayList();
    SystemFlavorMap localSystemFlavorMap = (SystemFlavorMap)SystemFlavorMap.getDefaultFlavorMap();
    int i = 0;
    if (i >= paramArrayOfDataFlavor.length)
      return localArrayList;
    Iterator localIterator = localSystemFlavorMap.getNativesForFlavor(paramArrayOfDataFlavor[i]).iterator();
    while (true)
    {
      if (!localIterator.hasNext())
      {
        i++;
        break;
      }
      String str = (String)localIterator.next();
      if (!localArrayList.contains(str))
        localArrayList.add(str);
    }
  }

  private String getText(boolean paramBoolean)
  {
    DataFlavor[] arrayOfDataFlavor = this.contents.getTransferDataFlavors();
    int i = 0;
    if (i >= arrayOfDataFlavor.length)
      return null;
    DataFlavor localDataFlavor = arrayOfDataFlavor[i];
    if (!localDataFlavor.isFlavorTextType());
    while (true)
    {
      i++;
      break;
      if ((!paramBoolean) || (isHtmlFlavor(localDataFlavor)))
        try
        {
          if (String.class.isAssignableFrom(localDataFlavor.getRepresentationClass()))
            return (String)this.contents.getTransferData(localDataFlavor);
          String str = getTextFromReader(localDataFlavor.getReaderForText(this.contents));
          return str;
        }
        catch (Exception localException)
        {
        }
    }
  }

  private String getTextFromReader(Reader paramReader)
    throws IOException
  {
    StringBuilder localStringBuilder = new StringBuilder();
    char[] arrayOfChar = new char[1024];
    while (true)
    {
      int i = paramReader.read(arrayOfChar);
      if (i <= 0)
        return localStringBuilder.toString();
      localStringBuilder.append(arrayOfChar, 0, i);
    }
  }

  private boolean isHtmlFlavor(DataFlavor paramDataFlavor)
  {
    return "html".equalsIgnoreCase(paramDataFlavor.getSubType());
  }

  protected DataFlavor[] getDataFlavors()
  {
    if (this.flavors == null)
      this.flavors = this.contents.getTransferDataFlavors();
    return this.flavors;
  }

  public String[] getFileList()
  {
    try
    {
      List localList = (List)this.contents.getTransferData(DataFlavor.javaFileListFlavor);
      String[] arrayOfString = (String[])localList.toArray(new String[localList.size()]);
      return arrayOfString;
    }
    catch (Exception localException)
    {
    }
    return null;
  }

  public String getHTML()
  {
    return getText(true);
  }

  public String[] getNativeFormats()
  {
    return (String[])getNativeFormatsList().toArray(new String[0]);
  }

  public List<String> getNativeFormatsList()
  {
    if (this.nativeFormats == null)
      this.nativeFormats = getNativesForFlavors(getDataFlavors());
    return this.nativeFormats;
  }

  public RawBitmap getRawBitmap()
  {
    DataFlavor[] arrayOfDataFlavor = this.contents.getTransferDataFlavors();
    for (int i = 0; ; i++)
    {
      if (i >= arrayOfDataFlavor.length)
        return null;
      DataFlavor localDataFlavor = arrayOfDataFlavor[i];
      Class localClass = localDataFlavor.getRepresentationClass();
      if ((localClass != null) && (Image.class.isAssignableFrom(localClass)) && ((localDataFlavor.isMimeTypeEqual(DataFlavor.imageFlavor)) || (localDataFlavor.isFlavorSerializedObjectType())))
        try
        {
          RawBitmap localRawBitmap = getImageBitmap((Image)this.contents.getTransferData(localDataFlavor));
          return localRawBitmap;
        }
        catch (Throwable localThrowable)
        {
        }
    }
  }

  public byte[] getSerializedObject(Class<?> paramClass)
  {
    try
    {
      DataFlavor localDataFlavor = new DataFlavor(paramClass, null);
      Serializable localSerializable = (Serializable)this.contents.getTransferData(localDataFlavor);
      ByteArrayOutputStream localByteArrayOutputStream = new ByteArrayOutputStream();
      new ObjectOutputStream(localByteArrayOutputStream).writeObject(localSerializable);
      byte[] arrayOfByte = localByteArrayOutputStream.toByteArray();
      return arrayOfByte;
    }
    catch (Throwable localThrowable)
    {
    }
    return null;
  }

  public String getText()
  {
    return getText(false);
  }

  public String getURL()
  {
    try
    {
      String str3 = ((URL)this.contents.getTransferData(urlFlavor)).toString();
      return str3;
    }
    catch (Exception localException1)
    {
      try
      {
        String str2 = ((URL)this.contents.getTransferData(uriFlavor)).toString();
        return str2;
      }
      catch (Exception localException2)
      {
        try
        {
          String str1 = new URL(getText()).toString();
          return str1;
        }
        catch (Exception localException3)
        {
        }
      }
    }
    return null;
  }

  public boolean isNativeFormatAvailable(String paramString)
  {
    return getNativeFormatsList().contains(paramString);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     org.apache.harmony.awt.datatransfer.DataSource
 * JD-Core Version:    0.6.2
 */