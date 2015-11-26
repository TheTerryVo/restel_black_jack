<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="xml" encoding="UTF-8" indent="no"
	doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
	doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />

<!--
====================================================
Root level template that defines the XML structure

dic-list and dic
====================================================
-->

<xsl:template match="/">
	<xsl:apply-templates />
</xsl:template>


<!-- 
	dic-list 
-->
<xsl:template match="dic-list">
	<xsl:for-each select="dic">
		<xsl:variable name="dic-bundle-id" select="./@bundle-id" />
		<xsl:variable name="dic-name" select="./@name" />
		<xsl:variable name="is-first-dic" select="( position() = 1 )" />
		<xsl:variable name="is-last-dic"  select="( position() = last() )" />
			<xsl:call-template name="dic">
				<xsl:with-param name="dic-bundle-id" select="$dic-bundle-id" />
				<xsl:with-param name="dic-name" select="$dic-name" />
				<xsl:with-param name="is-first-dic" select="$is-first-dic" />
				<xsl:with-param name="is-last-dic"  select="$is-last-dic" />
			</xsl:call-template>
	</xsl:for-each>
</xsl:template>

<!--
	dic
	Add dic-bundle-id attribute to dic node. 
-->
<xsl:template name="dic">
	<xsl:param name="dic-bundle-id" />
	<xsl:param name="dic-name" />
	<xsl:param name="is-first-dic" select="0" />
	<xsl:param name="is-last-dic"  select="0" />
		<div class="dic-divider">
			<xsl:attribute name="role">heading</xsl:attribute>
			<xsl:attribute name="aria-expanded">true</xsl:attribute>
			<xsl:attribute name="onclick">divider_onclick(this,'<xsl:value-of select="$dic-bundle-id" />');</xsl:attribute>
			<xsl:attribute name="id">dic-divider_<xsl:value-of select="$dic-bundle-id" /></xsl:attribute>
			<img src='DisclosureDown.pdf' style="float:left; position:relative; top:0.3em;" aria-hidden="true" />
			<table style="width:96%;"><tr>
				<td style="width:49%"><hr style="border-style:solid none none none; border-width:1px" /></td>
				<td style="white-space:nowrap"><xsl:value-of select="$dic-name" /></td>
				<td style="width:49%"><hr style="border-style:solid none none none; border-width:1px" /></td>
			</tr></table>
		</div>
		<div class="apple_head_message">
			<xsl:attribute name="id">not_found_<xsl:value-of select="$dic-bundle-id" /></xsl:attribute>
		</div>
		<div class="dic">
			<xsl:attribute name="dic-bundle-id">
				<xsl:value-of select="$dic-bundle-id" />
			</xsl:attribute>
			<xsl:attribute name="id">
				<xsl:value-of select="$dic-bundle-id" />
			</xsl:attribute>
			<xsl:attribute name="style">font-size:0px</xsl:attribute>
			<xsl:if test="($is-last-dic = 1) and ($is-first-dic = 0)">
				<!-- Add 400 pixel padding -->
				<xsl:attribute name="style">height:0px</xsl:attribute>
			</xsl:if>
			<xsl:apply-templates>
				<xsl:with-param name="dic-bundle-id" select="$dic-bundle-id" />
			</xsl:apply-templates>
			<xsl:if test="$is-last-dic = 1">
				<br />		<!-- extra space at bottom -->
			</xsl:if>
		</div>
		<xsl:if test="$is-last-dic = 0">
			<div />	
		</xsl:if>
</xsl:template>

<!--
	Default rule for all other tags
-->
<xsl:template match="@*|node()">
	<xsl:copy>
		<xsl:apply-templates select="@*|node()" />
	</xsl:copy>
</xsl:template>

</xsl:stylesheet>
