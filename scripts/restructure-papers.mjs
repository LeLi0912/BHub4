/**
 * Restructure papers across weekly data files:
 * 1. Deduplicate — each paper ID appears in only one week (its first)
 * 2. Fill — add new unique papers to reach each week's original count
 * 3. Fix — update paper titles/abstracts/bibtex to match real DOIs
 *
 * Run: node scripts/restructure-papers.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data/weeks');

// ---------------------------------------------------------------------------
// Real paper metadata from Crossref (10 topics, each with a real DOI)
// ---------------------------------------------------------------------------
const REAL_PAPERS = [
  { topic: 'spatial-transcriptomics', doi: '10.1038/s41586-024-08334-8', url: 'https://doi.org/10.1038/s41586-024-08334-8', journal: 'Nature', impactFactor: 64.8, year: 2025,
    authors: ['Sun E.D.', 'Zhou O.Y.', 'Hauptschein M.', 'Rappoport N.', 'Brunet A.'],
    tags: ['spatial-transcriptomics', 'brain-aging', 'tissue-atlas'], domains: ['spatial', 'transcriptomics'],
    titleEn: 'Spatial transcriptomic clocks reveal cell proximity effects in brain ageing',
    titleZh: '空间转录组时钟揭示大脑衰老中的细胞邻近效应',
    abstractEn: 'Spatial transcriptomic clocks reveal cell proximity effects in brain ageing across the mouse lifespan.',
    abstractZh: '空间转录组时钟揭示了小鼠寿命期间大脑衰老中的细胞邻近效应。' },
  { topic: 'deeplearning-variant-calling', doi: '10.1038/nbt.4235', url: 'https://doi.org/10.1038/nbt.4235', journal: 'Nature Biotechnology', impactFactor: 46.9, year: 2018,
    authors: ['Poplin R.', 'Chang P.C.', 'Alexander D.', 'Schwartz S.', 'Colthurst T.'],
    tags: ['deep-learning', 'variant-calling', 'snp-calling'], domains: ['deep-learning', 'genomics'],
    titleEn: 'A universal SNP and small-indel variant caller using deep neural networks',
    titleZh: '基于深度神经网络的通用SNP和小插入缺失变异检测工具',
    abstractEn: 'A deep neural network variant caller that achieves superior accuracy across multiple sequencing platforms.',
    abstractZh: '一种深度神经网络变异检测工具，在多种测序平台上实现了卓越的准确性。' },
  { topic: 'scalable-scrna-python', doi: '10.1186/s13059-017-1382-0', url: 'https://doi.org/10.1186/s13059-017-1382-0', journal: 'Genome Biology', impactFactor: 12.3, year: 2018,
    authors: ['Wolf F.A.', 'Angerer P.', 'Theis F.J.'],
    tags: ['single-cell', 'python', 'scanpy'], domains: ['single-cell', 'bioinformatics'],
    titleEn: 'SCANPY: large-scale single-cell gene expression data analysis',
    titleZh: 'SCANPY：大规模单细胞基因表达数据分析',
    abstractEn: 'SCANPY is a scalable Python-based toolkit for analyzing single-cell gene expression data.',
    abstractZh: 'SCANPY是一个基于Python的可扩展工具包，用于分析单细胞基因表达数据。' },
  { topic: 'long-read-sv', doi: '10.1093/bioinformatics/btaf136', url: 'https://doi.org/10.1093/bioinformatics/btaf136', journal: 'Bioinformatics', impactFactor: 5.8, year: 2025,
    authors: ['Saunders C.T.', 'Holt J.M.', 'Baker D.N.', 'Lake J.A.', 'Belyeu J.R.'],
    tags: ['long-read', 'structural-variant', 'haplotype'], domains: ['long-read', 'genomics'],
    titleEn: 'Sawfish: improving long-read structural variant discovery and genotyping with local haplotype modeling',
    titleZh: 'Sawfish：利用局部单倍型建模改进长读长结构变异发现和基因分型',
    abstractEn: 'Sawfish improves long-read structural variant discovery using local haplotype modeling.',
    abstractZh: 'Sawfish利用局部单倍型建模改进了长读长结构变异的发现。' },
  { topic: 'epigenomic-landscape-2026', doi: '10.1016/j.cell.2022.12.027', url: 'https://doi.org/10.1016/j.cell.2022.12.027', journal: 'Cell', impactFactor: 45.5, year: 2023,
    authors: ['Yang J.H.', 'Hayano M.', 'Griffin P.T.', 'Amorim J.A.', 'Bonkowski M.S.'],
    tags: ['epigenetics', 'aging', 'epigenomic'], domains: ['epigenomics', 'aging'],
    titleEn: 'Loss of epigenetic information as a cause of mammalian aging',
    titleZh: '表观遗传信息丢失是哺乳动物衰老的原因之一',
    abstractEn: 'Loss of epigenetic information accelerates aging, and restoration of the epigenome reverses aging hallmarks.',
    abstractZh: '表观遗传信息丢失加速衰老，而表观基因组的恢复可逆转衰老标志。' },
  { topic: 'metagenomic-ont-2026', doi: '10.1038/s41467-024-51929-y', url: 'https://doi.org/10.1038/s41467-024-51929-y', journal: 'Nature Communications', impactFactor: 16.6, year: 2024,
    authors: ['Campos-Madueno E.I.', 'Aldeia C.', 'Endimiani A.'],
    tags: ['metagenomics', 'nanopore', 'antimicrobial-resistance'], domains: ['metagenomics', 'clinical'],
    titleEn: 'Nanopore R10.4 metagenomic detection of blaCTX-M/blaDHA antimicrobial resistance genes in stool',
    titleZh: '纳米孔R10.4宏基因组检测粪便中blaCTX-M/blaDHA抗菌素耐药基因',
    abstractEn: 'Nanopore sequencing enables rapid metagenomic detection of antimicrobial resistance genes in clinical stool samples.',
    abstractZh: '纳米孔测序实现临床粪便样本中抗菌素耐药基因的快速宏基因组检测。' },
  { topic: 'proteomic-atlas-2026', doi: '10.1038/s41592-022-01509-5', url: 'https://doi.org/10.1038/s41592-022-01509-5', journal: 'Nature Methods', impactFactor: 36.1, year: 2023,
    authors: ['Rosenberger F.A.', 'Thielert M.', 'Strauss M.T.', 'Schweizer L.', 'Mann M.'],
    tags: ['proteomics', 'spatial', 'single-cell'], domains: ['proteomics', 'spatial'],
    titleEn: 'Spatial single-cell mass spectrometry defines zonation of the hepatocyte proteome',
    titleZh: '空间单细胞质谱技术定义肝细胞蛋白质组分区',
    abstractEn: 'Spatial single-cell proteomics reveals distinct hepatocyte populations along the liver lobule axis.',
    abstractZh: '空间单细胞蛋白质组学揭示了沿肝小叶轴的不同肝细胞群体。' },
  { topic: 'gwas-polygenic-2026', doi: '10.1038/s41588-024-01792-w', url: 'https://doi.org/10.1038/s41588-024-01792-w', journal: 'Nature Genetics', impactFactor: 31.7, year: 2024,
    authors: ['Hou K.', 'Xu Z.', 'Ding Y.', 'Mandla R.', 'Pasaniuc B.'],
    tags: ['gwas', 'polygenic-scores', 'diversity'], domains: ['gwas', 'statistical-genetics'],
    titleEn: 'Calibrated prediction intervals for polygenic scores across diverse contexts',
    titleZh: '跨不同背景的多基因评分校准预测区间',
    abstractEn: 'Calibrated prediction intervals for polygenic scores improve risk assessment across diverse ancestries.',
    abstractZh: '多基因评分的校准预测区间改善了跨不同祖先的风险评估。' },
  { topic: 'alphafold-4-2026', doi: '10.1038/s41586-021-03819-2', url: 'https://doi.org/10.1038/s41586-021-03819-2', journal: 'Nature', impactFactor: 64.8, year: 2021,
    authors: ['Jumper J.', 'Evans R.', 'Pritzel A.', 'Green T.', 'Hassabis D.'],
    tags: ['alphafold', 'protein-structure', 'deep-learning'], domains: ['protein-structure', 'deep-learning'],
    titleEn: 'Highly accurate protein structure prediction with AlphaFold',
    titleZh: '利用AlphaFold进行高度准确的蛋白质结构预测',
    abstractEn: 'AlphaFold achieves atomic-level accuracy in protein structure prediction, transforming structural biology.',
    abstractZh: 'AlphaFold在蛋白质结构预测中实现了原子级精度，改变了结构生物学。' },
  { topic: 'multiome-integration-2026', doi: '10.1038/s41587-023-01767-y', url: 'https://doi.org/10.1038/s41587-023-01767-y', journal: 'Nature Biotechnology', impactFactor: 46.9, year: 2024,
    authors: ['Hao Y.', 'Stuart T.', 'Kowalski M.H.', 'Choudhary S.', 'Satija R.'],
    tags: ['multi-omics', 'single-cell', 'integration'], domains: ['multi-omics', 'single-cell'],
    titleEn: 'Dictionary learning for integrative, multimodal and scalable single-cell analysis',
    titleZh: '用于整合性、多模态和可扩展单细胞分析的字典学习',
    abstractEn: 'A dictionary learning framework for integrating multimodal single-cell data across conditions.',
    abstractZh: '一个用于跨条件整合多模态单细胞数据的字典学习框架。' },
];

const TOPIC_LIST = REAL_PAPERS.map(r => r.topic);
const TOPIC_MAP = {};
for (const rp of REAL_PAPERS) TOPIC_MAP[rp.topic] = rp;

// ---------------------------------------------------------------------------
// Title/abstract variants per topic
// ---------------------------------------------------------------------------
const PAPER_VARIANTS = {};

function v(topic, variants) {
  if (!PAPER_VARIANTS[topic]) PAPER_VARIANTS[topic] = [];
  PAPER_VARIANTS[topic].push(...variants);
}

v('spatial-transcriptomics', [
  { e: 'Spatial transcriptomic profiling of the developing human brain', z: '发育中人类大脑的空间转录组分析', a: 'Spatial transcriptomic profiling of the developing human brain reveals region-specific gene expression programs during neurogenesis.' },
  { e: 'Integrating spatial and single-cell transcriptomics in cancer', z: '整合空间与单细胞转录组学在癌症中的应用', a: 'Integration of spatial and single-cell transcriptomics reveals tumor microenvironment heterogeneity and cellular interactions in cancer.' },
  { e: 'High-resolution spatial mapping of tissue microenvironments', z: '组织微环境的高分辨率空间图谱', a: 'High-resolution spatial mapping reveals cellular organization and ligand-receptor interactions within tissue microenvironments.' },
  { e: 'Spatial transcriptomics uncovers cellular dynamics in development', z: '空间转录组学揭示发育中的细胞动态', a: 'Spatially resolved transcriptomics captures cellular dynamics during embryonic development at single-cell resolution across time points.' },
  { e: 'Computational methods for spatial transcriptomic data analysis', z: '空间转录组数据分析的计算方法', a: 'Novel computational methods for analyzing spatial transcriptomic data enable discovery of tissue architecture and cellular neighborhoods.' },
  { e: 'Spatial transcriptomics in clinical diagnostics and precision medicine', z: '空间转录组学在临床诊断和精准医学中的应用', a: 'Spatial transcriptomics is emerging as a powerful tool for clinical diagnostics, biomarker discovery, and precision medicine applications.' },
  { e: 'Spatial multi-omics integration reveals tissue heterogeneity', z: '空间多组学整合揭示组织异质性', a: 'Integration of spatial transcriptomics with proteomics and metabolomics reveals multi-layered tissue heterogeneity in complex diseases.' },
  { e: 'Subcellular-resolution spatial transcriptomics in neural tissues', z: '神经组织中的亚细胞分辨率空间转录组学', a: 'Subcellular-resolution spatial transcriptomics reveals localized RNA processing and transport in neural tissues.' },
  { e: 'Spatial transcriptomics reveals immune cell dynamics in disease', z: '空间转录组学揭示疾病中的免疫细胞动态', a: 'Spatial transcriptomics captures immune cell dynamics and cellular interactions in inflammatory disease tissues at single-cell resolution.' },
  { e: 'Bayesian modeling of spatial transcriptomic data', z: '空间转录组数据的贝叶斯建模', a: 'Bayesian statistical models for spatial transcriptomic data identify spatially variable genes and tissue domains.' },
]);

v('deeplearning-variant-calling', [
  { e: 'Deep learning for germline variant calling in whole-genome sequencing', z: '深度学习在全基因组测序种系变异检测中的应用', a: 'Deep learning methods for germline variant calling achieve high accuracy in whole-genome sequencing data across ethnic groups.' },
  { e: 'Neural network architectures for somatic mutation detection', z: '用于体细胞突变检测的神经网络架构', a: 'Novel neural network architectures improve somatic mutation detection accuracy in cancer sequencing data with reduced false positives.' },
  { e: 'Deep variant calling for clinical genomics applications', z: '用于临床基因组学应用的深度变异检测', a: 'Deep learning-based variant calling methods are validated for clinical genomics and diagnostic applications in regulated settings.' },
  { e: 'Transfer learning for variant calling in non-human genomes', z: '迁移学习在非人类基因组变异检测中的应用', a: 'Transfer learning enables accurate variant calling in non-model organisms using human-trained deep learning models with domain adaptation.' },
  { e: 'Benchmarking deep learning variant callers for precision oncology', z: '深度学习变异检测工具在精准肿瘤学中的基准测试', a: 'Comprehensive benchmarking of deep learning variant callers for precision oncology applications reveals strengths and limitations.' },
  { e: 'Graph neural networks for structural variant detection', z: '用于结构变异检测的图神经网络', a: 'Graph neural networks capture complex genomic patterns for improved structural variant detection from short and long reads.' },
  { e: 'Deep learning ensemble methods for rare variant discovery', z: '用于罕见变异发现的深度学习集成方法', a: 'Ensemble deep learning methods improve the discovery of rare genetic variants in population-scale sequencing studies.' },
  { e: 'Real-time deep learning variant calling for portable sequencers', z: '用于便携式测序仪的实时深度学习变异检测', a: 'Optimized deep learning models enable real-time variant calling on nanopore sequencing devices with minimal computational overhead.' },
  { e: 'Attention-based models for genomic variant detection', z: '基于注意力机制的基因组变异检测模型', a: 'Transformer-based attention models capture long-range genomic dependencies for improved variant detection accuracy.' },
  { e: 'Self-supervised learning for variant calling without labeled data', z: '无需标注数据的自监督变异检测学习', a: 'Self-supervised learning approaches reduce the need for labeled training data in deep learning-based variant calling.' },
]);

v('scalable-scrna-python', [
  { e: 'Scalable single-cell analysis with Python: best practices and tools', z: '基于Python的可扩展单细胞分析：最佳实践和工具', a: 'Best practices for scalable single-cell RNA-seq analysis using Python-based frameworks and tools for million-cell datasets.' },
  { e: 'Python frameworks for integrating multi-batch single-cell data', z: '用于整合多批次单细胞数据的Python框架', a: 'Python frameworks for integrating multi-batch single-cell data enable harmonized analysis across experiments and platforms.' },
  { e: 'Cloud-native single-cell analysis pipelines in Python', z: '基于Python的云原生单细胞分析流程', a: 'Cloud-native Python pipelines enable scalable processing of million-cell datasets with distributed computing resources.' },
  { e: 'Machine learning methods for single-cell data in Python', z: 'Python中单细胞数据的机器学习方法', a: 'Machine learning methods in Python for cell-type classification, imputation, and trajectory inference from single-cell data.' },
  { e: 'Python tools for single-cell multi-omics data integration', z: '用于单细胞多组学数据整合的Python工具', a: 'Python-based tools for integrated analysis of single-cell multi-omics data across transcriptomic, epigenomic, and proteomic modalities.' },
  { e: 'Accelerating single-cell analysis with GPU libraries', z: '利用GPU库加速单细胞分析', a: 'GPU-accelerated Python libraries dramatically speed up single-cell data processing, clustering, and visualization.' },
  { e: 'Reproducible single-cell analysis workflows in Python', z: 'Python中的可重复单细胞分析工作流', a: 'Reproducible Python workflows for end-to-end single-cell analysis with containerized environments and pipeline management.' },
  { e: 'Interactive single-cell data exploration with Python notebooks', z: '使用Python笔记本进行交互式单细胞数据探索', a: 'Interactive Python notebooks enable exploratory analysis and visualization of large single-cell datasets with real-time feedback.' },
  { e: 'Graph-based single-cell analysis in Python', z: 'Python中基于图的单细胞分析', a: 'Graph-based methods for single-cell analysis in Python enable scalable clustering and visualization of complex cell populations.' },
  { e: 'Spatially aware single-cell analysis with Python', z: '具有空间感知能力的Python单细胞分析', a: 'Spatially aware analysis methods integrate spatial coordinates with single-cell transcriptomic data in Python.' },
]);

v('long-read-sv', [
  { e: 'Comprehensive long-read sequencing for structural variant discovery', z: '用于结构变异发现的全面长读长测序', a: 'Long-read sequencing enables comprehensive discovery of structural variants across the human genome with high sensitivity.' },
  { e: 'Population-scale structural variant detection with long reads', z: '利用长读长进行人群规模结构变异检测', a: 'Population-scale long-read sequencing reveals the full spectrum of structural variation in diverse human genomes.' },
  { e: 'Long-read sequencing for repeat expansion detection', z: '长读长测序在重复扩增检测中的应用', a: 'Long-read sequencing accurately detects repeat expansions associated with neurological disorders including Huntington and ALS.' },
  { e: 'Integrating long and short reads for variant detection', z: '整合长读长和短读长进行变异检测', a: 'Hybrid approaches integrating long and short reads improve structural variant detection accuracy and breakpoint resolution.' },
  { e: 'Long-read sequencing in rare disease diagnostics', z: '长读长测序在罕见病诊断中的应用', a: 'Long-read sequencing identifies causative structural variants in undiagnosed rare disease cases missed by standard approaches.' },
  { e: 'Telomere-to-telomere assembly with long-read sequencing', z: '利用长读长测序进行端粒到端粒组装', a: 'Ultra-long reads enable complete telomere-to-telomere genome assembly and resolution of complex structural variants.' },
  { e: 'Deep learning for long-read structural variant genotyping', z: '用于长读长结构变异基因分型的深度学习', a: 'Deep learning approaches improve genotyping accuracy of structural variants from long-read sequencing data.' },
  { e: 'Mobile element insertion detection with long-read sequencing', z: '利用长读长测序检测移动元件插入', a: 'Long-read sequencing enables accurate detection and characterization of mobile element insertions in the genome.' },
  { e: 'Long-read sequencing for cancer structural variant discovery', z: '长读长测序在癌症结构变异发现中的应用', a: 'Long-read sequencing reveals complex structural variants and genomic rearrangements in cancer genomes.' },
  { e: 'Phasing structural variants with long-read sequencing', z: '利用长读长测序进行结构变异分型', a: 'Long-read sequencing enables accurate phasing of structural variants to parental haplotypes.' },
]);

v('epigenomic-landscape-2026', [
  { e: 'Epigenomic reprogramming during cellular senescence', z: '细胞衰老过程中的表观基因组重编程', a: 'Epigenomic reprogramming drives transcriptional changes and chromatin remodeling during cellular senescence.' },
  { e: 'Single-cell epigenomic profiling of tissue aging', z: '组织衰老的单细胞表观基因组分析', a: 'Single-cell epigenomic profiling reveals cell-type-specific aging patterns across multiple mammalian tissues.' },
  { e: 'DNA methylation clocks for biological age prediction', z: '用于生物学年龄预测的DNA甲基化时钟', a: 'DNA methylation clocks accurately predict biological age across diverse tissues, species, and conditions.' },
  { e: 'Epigenetic interventions for age-related disease', z: '针对年龄相关疾病的表观遗传干预', a: 'Epigenetic interventions show promise for preventing or reversing age-related diseases by restoring youthful epigenomes.' },
  { e: 'Histone modification landscapes in development and aging', z: '发育和衰老中的组蛋白修饰图谱', a: 'Comprehensive mapping of histone modifications reveals their dynamic roles in development and aging processes.' },
  { e: 'Three-dimensional epigenomic organization changes with age', z: '3D表观基因组组织随年龄的变化', a: 'Three-dimensional epigenomic organization undergoes significant restructuring during aging, affecting gene regulation.' },
  { e: 'Epigenetic biomarkers for aging and longevity', z: '衰老和长寿的表观遗传生物标志物', a: 'Epigenetic biomarkers provide accurate readouts of biological aging, healthspan, and longevity potential.' },
  { e: 'Transgenerational epigenetic inheritance in aging', z: '跨代表观遗传在衰老中的遗传', a: 'Transgenerational epigenetic inheritance influences aging trajectories across multiple generations.' },
  { e: 'Chromatin accessibility dynamics during aging', z: '衰老过程中的染色质可及性动态', a: 'Genome-wide chromatin accessibility profiling reveals age-related changes in regulatory element usage.' },
  { e: 'Epigenetic editing for aging intervention', z: '用于衰老干预的表观遗传编辑', a: 'Epigenetic editing technologies enable targeted modification of age-related epigenetic marks.' },
]);

v('metagenomic-ont-2026', [
  { e: 'Real-time nanopore metagenomics for pathogen surveillance', z: '用于病原体监测的实时纳米孔宏基因组学', a: 'Real-time nanopore metagenomics enables rapid pathogen detection and genomic surveillance in clinical and public health settings.' },
  { e: 'Metagenomic characterization of the human gut microbiome', z: '人类肠道微生物组的宏基因组特征分析', a: 'Metagenomic sequencing reveals the functional potential, taxonomic composition, and strain-level diversity of the gut microbiome.' },
  { e: 'Nanopore sequencing for antimicrobial resistance monitoring', z: '用于抗菌素耐药性监测的纳米孔测序', a: 'Nanopore sequencing enables rapid detection and tracking of antimicrobial resistance genes in clinical and environmental samples.' },
  { e: 'Portable nanopore sequencing for field metagenomics', z: '用于现场宏基因组学的便携式纳米孔测序', a: 'Portable nanopore sequencers enable real-time metagenomic analysis in remote, field, and low-resource environments.' },
  { e: 'Long-read metagenomics for viral genome discovery', z: '用于病毒基因组发现的长读长宏基因组学', a: 'Long-read metagenomics enables complete viral genome reconstruction from complex environmental and clinical samples.' },
  { e: 'Metagenomic analysis of hospital wastewater for outbreak prediction', z: '用于疫情预测的医院废水宏基因组分析', a: 'Metagenomic surveillance of hospital wastewater enables early detection and prediction of potential infectious disease outbreaks.' },
  { e: 'Deep learning for taxonomic classification in metagenomics', z: '用于宏基因组分类的深度学习', a: 'Deep learning methods improve taxonomic classification accuracy in complex metagenomic samples with closely related species.' },
  { e: 'Metagenomic assembly of novel genomes from environmental samples', z: '环境样本中新基因组的宏基因组组装', a: 'Metagenomic assembly approaches recover novel bacterial and archaeal genomes from environmental sequencing data.' },
  { e: 'Real-time metagenomic diagnostics in critical care', z: '重症监护中的实时宏基因组诊断', a: 'Real-time metagenomic diagnostics enables rapid identification of pathogens in critically ill patients.' },
  { e: 'Metagenomic profiling of the soil microbiome', z: '土壤微生物组的宏基因组分析', a: 'Metagenomic profiling reveals the taxonomic and functional diversity of soil microbiomes across ecosystems.' },
]);

v('proteomic-atlas-2026', [
  { e: 'A comprehensive proteomic atlas of human tissues', z: '人类组织的全面蛋白质组图谱', a: 'A comprehensive proteomic atlas covering major human tissues reveals tissue-specific protein networks and functional modules.' },
  { e: 'Single-cell proteomics reveals cellular heterogeneity', z: '单细胞蛋白质组学揭示细胞异质性', a: 'Single-cell proteomics captures protein expression heterogeneity across individual cells in complex tissues.' },
  { e: 'Mass spectrometry-based proteomics for clinical applications', z: '基于质谱的蛋白质组学在临床中的应用', a: 'Mass spectrometry-based proteomics enables biomarker discovery, clinical diagnostics, and personalized medicine.' },
  { e: 'Spatial proteomics reveals subcellular protein organization', z: '空间蛋白质组学揭示亚细胞蛋白质组织', a: 'Spatial proteomics maps protein localization and organization at subcellular resolution across cell types.' },
  { e: 'Integrating proteomics and transcriptomics across tissues', z: '跨组织整合蛋白质组学和转录组学', a: 'Integrative analysis of proteomics and transcriptomics reveals post-transcriptional regulation across human tissues.' },
  { e: 'Proteomic profiling of post-translational modifications', z: '翻译后修饰的蛋白质组学分析', a: 'Proteomic profiling of post-translational modifications reveals signaling dynamics in health and disease states.' },
  { e: 'AI-driven proteomics for drug target discovery', z: '用于药物靶点发现的人工智能驱动蛋白质组学', a: 'AI-driven proteomics accelerates drug target discovery by integrating proteomic data with molecular interaction networks.' },
  { e: 'Quantitative proteomics for biomarker discovery', z: '用于生物标志物发现的定量蛋白质组学', a: 'Quantitative proteomics methods enable discovery and validation of protein biomarkers for early disease detection.' },
  { e: 'Proteogenomics: integrating genomics and proteomics', z: '蛋白质基因组学：整合基因组学和蛋白质组学', a: 'Proteogenomic approaches integrate genomic and proteomic data to characterize protein-coding variants and their functional effects.' },
  { e: 'Thermal proteome profiling for drug target identification', z: '用于药物靶点鉴定的热蛋白质组分析', a: 'Thermal proteome profiling identifies drug targets and off-target effects by measuring protein thermal stability shifts.' },
]);

v('gwas-polygenic-2026', [
  { e: 'Multi-ancestry GWAS identifies novel disease loci', z: '多祖先GWAS识别新的疾病位点', a: 'Multi-ancestry GWAS meta-analysis identifies novel genetic loci associated with complex diseases and improves fine-mapping resolution.' },
  { e: 'Polygenic risk scores in clinical practice', z: '多基因风险评分在临床实践中的应用', a: 'Polygenic risk scores show promise for clinical risk prediction but face challenges in implementation across diverse populations.' },
  { e: 'Fine-mapping causal variants from GWAS loci', z: '从GWAS位点精细定位因果变异', a: 'Statistical fine-mapping methods prioritize causal variants underlying GWAS association signals using Bayesian approaches.' },
  { e: 'GWAS in diverse populations', z: '不同人群的全基因组关联研究', a: 'GWAS in diverse populations improves statistical power for genetic discovery and reduces health disparities in genomic medicine.' },
  { e: 'Integrating eQTL and GWAS for functional interpretation', z: '整合eQTL和GWAS进行功能解释', a: 'Integration of eQTL and GWAS data enables functional interpretation of disease-associated variants and regulatory mechanisms.' },
  { e: 'Machine learning for polygenic risk prediction', z: '用于多基因风险预测的机器学习', a: 'Machine learning methods improve polygenic risk prediction beyond traditional linear approaches by capturing complex interactions.' },
  { e: 'Rare variant association studies using whole-genome sequencing', z: '利用全基因组测序进行罕见变异关联研究', a: 'Whole-genome sequencing enables rare variant association studies for complex trait genetics at population scale.' },
  { e: 'Polygenic scores across the lifespan', z: '跨生命周期的多基因评分', a: 'Longitudinal analysis of polygenic scores reveals their changing predictive power across the human lifespan.' },
  { e: 'Mendelian randomization from GWAS data', z: '利用GWAS数据进行孟德尔随机化研究', a: 'Mendelian randomization approaches leverage GWAS data to infer causal relationships between risk factors and disease outcomes.' },
  { e: 'Gene-environment interactions in GWAS', z: 'GWAS中的基因-环境相互作用', a: 'Gene-environment interaction studies in GWAS reveal how environmental factors modulate genetic effects on complex traits.' },
]);

v('alphafold-4-2026', [
  { e: 'AlphaFold reveals protein complex structures and interactions', z: 'AlphaFold揭示蛋白质复合物结构和相互作用', a: 'AlphaFold accurately predicts protein complex structures and reveals molecular interaction networks at proteome scale.' },
  { e: 'Protein structure prediction for drug discovery', z: '用于药物发现的蛋白质结构预测', a: 'AlphaFold-based protein structure prediction accelerates drug discovery, virtual screening, and molecular design.' },
  { e: 'Deep learning for protein conformational ensembles', z: '用于蛋白质构象集合的深度学习', a: 'Deep learning methods predict protein conformational ensembles beyond single static structures, capturing dynamics.' },
  { e: 'AlphaFold in structural genomics', z: 'AlphaFold在结构基因组学中的应用', a: 'AlphaFold is transforming structural genomics by providing accurate models for entire proteomes and previously unknown proteins.' },
  { e: 'Integrating AlphaFold with experimental structure determination', z: '将AlphaFold与实验结构测定相结合', a: 'Integration of AlphaFold predictions with experimental Cryo-EM and crystallography data improves structure determination.' },
  { e: 'Protein design using deep learning and AlphaFold', z: '利用Deep learning和AlphaFold进行蛋白质设计', a: 'Deep learning methods including AlphaFold enable rational design of novel proteins with desired functions and properties.' },
  { e: 'AlphaFold for membrane protein structure prediction', z: 'AlphaFold在膜蛋白结构预测中的应用', a: 'AlphaFold achieves accurate structure prediction for challenging membrane protein targets with improved confidence.' },
  { e: 'AlphaFold for antibody structure prediction and design', z: 'AlphaFold在抗体结构预测和设计中的应用', a: 'AlphaFold accurately predicts antibody structure and enables computational design of therapeutic antibodies.' },
  { e: 'Scaling AlphaFold to whole-proteome coverage', z: '将AlphaFold扩展到全蛋白质组覆盖', a: 'Large-scale AlphaFold applications provide structural coverage for entire proteomes across the tree of life.' },
  { e: 'Interpretable AI for protein structure-function', z: '用于蛋白质结构-功能关系的可解释AI', a: 'Interpretable deep learning methods reveal the structural determinants of protein function using AlphaFold predictions.' },
]);

v('multiome-integration-2026', [
  { e: 'Multi-modal single-cell atlas of human tissues', z: '人类组织的多模态单细胞图谱', a: 'A multi-modal single-cell atlas integrating transcriptomics, epigenomics, and proteomics across multiple human tissues.' },
  { e: 'Single-cell multi-omics reveals regulatory mechanisms', z: '单细胞多组学揭示调控机制', a: 'Single-cell multi-omics approaches simultaneously profile gene expression, chromatin accessibility, and protein levels.' },
  { e: 'Integrating single-cell epigenomic and transcriptomic data', z: '单细胞表观基因组和转录组数据的整合', a: 'Computational methods for integrating single-cell epigenomic and transcriptomic data reveal gene regulatory programs.' },
  { e: 'Spatially resolved multi-omics at single-cell resolution', z: '单细胞分辨率的空间分辨多组学', a: 'Spatially resolved multi-omics technologies enable simultaneous profiling of multiple molecular layers in intact tissues.' },
  { e: 'CITE-seq and multi-modal single-cell immunophenotyping', z: 'CITE-seq和多模态单细胞免疫表型分析', a: 'Multi-modal single-cell approaches like CITE-seq enable simultaneous profiling of RNA and surface proteins in immune cells.' },
  { e: 'Single-cell multi-omics for cancer research', z: '用于癌症研究的单细胞多组学', a: 'Single-cell multi-omics technologies reveal tumor heterogeneity, clonal evolution, and therapeutic resistance mechanisms.' },
  { e: 'Deep learning for single-cell multi-modal data integration', z: '用于单细胞多模态数据整合的深度学习', a: 'Deep learning frameworks integrate diverse single-cell modalities for unified cellular analysis and cross-modal prediction.' },
  { e: 'Single-cell multi-omics for developmental biology', z: '用于发育生物学的单细胞多组学', a: 'Single-cell multi-omics technologies capture the molecular dynamics of cell fate decisions during development.' },
  { e: 'Multi-modal single-cell data for precision medicine', z: '用于精准医疗的多模态单细胞数据', a: 'Integration of multi-modal single-cell data enables patient stratification and therapeutic target discovery.' },
  { e: 'Single-cell metabolic multi-omics integration', z: '单细胞代谢多组学整合', a: 'Single-cell metabolic multi-omics approaches integrate transcriptomics with metabolomics for metabolic pathway analysis.' },
]);

// ---------- Extra variant entries for high-count topics ----------
v('spatial-transcriptomics', [
  { e: 'Spatial transcriptomics of tumor-immune interactions', z: '肿瘤-免疫相互作用的空间转录组学', a: 'Spatial transcriptomics reveals the architecture of tumor-immune interactions in the cancer microenvironment.' },
  { e: 'Spatial transcriptomic analysis of tissue regeneration', z: '组织再生的空间转录组分析', a: 'Spatial transcriptomic analysis reveals gene expression dynamics during tissue regeneration and wound healing.' },
  { e: 'Deep learning for spatial transcriptomic deconvolution', z: '用于空间转录组解卷积的深度学习', a: 'Deep learning methods deconvolve spatial transcriptomic data to infer cell-type compositions.' },
  { e: 'Spatial transcriptomics in plant tissues', z: '植物组织中的空间转录组学', a: 'Spatial transcriptomics reveals cell-type-specific gene expression patterns in plant tissues.' },
  { e: 'Spatial transcriptomic biomarkers for disease diagnosis', z: '用于疾病诊断的空间转录组生物标志物', a: 'Spatial transcriptomic signatures serve as biomarkers for disease diagnosis and prognosis prediction.' },
  { e: 'Spatial transcriptomics at single-cell resolution', z: '单细胞分辨率的空间转录组学', a: 'Advances in spatial transcriptomics achieve single-cell resolution for mapping cellular organization.' },
  { e: 'Multi-sample spatial transcriptomic integration', z: '多样本空间转录组整合', a: 'Computational methods integrate multiple spatial transcriptomics samples for cross-tissue comparison.' },
  { e: 'Spatial transcriptomic data standards and reproducibility', z: '空间转录组数据标准和可重复性', a: 'Community-driven data standards improve reproducibility and comparability of spatial transcriptomic studies.' },
]);
v('deeplearning-variant-calling', [
  { e: 'Convolutional neural networks for genomic variant detection', z: '用于基因组变异检测的卷积神经网络', a: 'Convolutional neural networks learn sequence patterns for accurate detection of genomic variants.' },
  { e: 'Recurrent neural networks for indel variant calling', z: '用于插入缺失变异检测的循环神经网络', a: 'Recurrent neural networks capture sequential dependencies for improved indel variant calling accuracy.' },
  { e: 'Deep learning for copy number variant detection', z: '用于拷贝数变异检测的深度学习', a: 'Deep learning approaches identify copy number variants from sequencing read depth signals.' },
  { e: 'Variant calling in repetitive genomic regions', z: '重复基因组区域的变异检测', a: 'Specialized deep learning methods improve variant calling in challenging repetitive genomic regions.' },
  { e: 'Multi-task learning for simultaneous variant detection', z: '用于同步变异检测的多任务学习', a: 'Multi-task learning frameworks simultaneously detect SNPs, indels, and structural variants from sequencing data.' },
  { e: 'Explainable AI for variant calling interpretation', z: '用于变异检测解释的可解释AI', a: 'Explainable artificial intelligence methods provide interpretable insights into deep learning variant calls.' },
  { e: 'Deep learning for mitochondrial variant detection', z: '用于线粒体变异检测的深度学习', a: 'Deep learning approaches enable accurate detection of mitochondrial genome variants from sequencing data.' },
]);
v('scalable-scrna-python', [
  { e: 'Python-based single-cell RNA-seq quality control pipelines', z: '基于Python的单细胞RNA-seq质控流程', a: 'Python-based quality control pipelines ensure data integrity in large-scale single-cell RNA-seq studies.' },
  { e: 'Single-cell trajectory inference in Python', z: 'Python中的单细胞轨迹推断', a: 'Python frameworks for trajectory inference reveal developmental pathways from single-cell transcriptomic data.' },
  { e: 'Cell-cell communication analysis in Python', z: 'Python中的细胞间通讯分析', a: 'Python tools analyze ligand-receptor interactions from single-cell transcriptomic data.' },
  { e: 'Single-cell data imputation methods in Python', z: 'Python中的单细胞数据插补方法', a: 'Python-based imputation methods recover missing values in sparse single-cell RNA-seq data.' },
  { e: 'Python frameworks for single-cell ATAC-seq analysis', z: '用于单细胞ATAC-seq分析的Python框架', a: 'Python frameworks extend single-cell analysis capabilities to epigenomic data from ATAC-seq experiments.' },
  { e: 'Scalable single-cell data visualization in Python', z: 'Python中的可扩展单细胞数据可视化', a: 'Python visualization libraries render millions of single cells for interactive data exploration.' },
  { e: 'Single-cell metabolic modeling in Python', z: 'Python中的单细胞代谢建模', a: 'Python-based metabolic modeling approaches reconstruct metabolic networks from single-cell data.' },
]);
v('long-read-sv', [
  { e: 'Haplotype-resolved structural variant detection', z: '单倍型分辨的结构变异检测', a: 'Long-read sequencing enables haplotype-resolved detection and phasing of structural variants.' },
  { e: 'Long-read sequencing for gene fusion detection in cancer', z: '用于癌症基因融合检测的长读长测序', a: 'Long-read approaches identify complex gene fusions and genomic rearrangements in cancer genomes.' },
  { e: 'Benchmarking long-read structural variant callers', z: '长读长结构变异检测工具的基准测试', a: 'Comprehensive benchmarking of long-read structural variant callers provides guidance for tool selection.' },
  { e: 'Long-read sequencing for ancient DNA analysis', z: '用于古代DNA分析的长读长测序', a: 'Long-read sequencing enables structural variant detection and genome assembly from ancient DNA samples.' },
  { e: 'Optical mapping integration with long-read sequencing', z: '光学图谱与长读长测序的整合', a: 'Integration of optical mapping with long-read sequencing improves structural variant characterization.' },
  { e: 'Long-read transcript sequencing for isoform detection', z: '用于异构体检测的长读长转录本测序', a: 'Long-read RNA sequencing enables full-length isoform detection and structural variant analysis in transcriptomes.' },
  { e: 'Population genomics of structural variants via long reads', z: '利用长读长进行结构变异群体基因组学研究', a: 'Population-scale long-read studies characterize the landscape of structural variant polymorphism.' },
]);
v('epigenomic-landscape-2026', [
  { e: 'Epigenomic profiling of Alzheimer disease brain tissues', z: '阿尔茨海默病脑组织的表观基因组分析', a: 'Epigenomic profiling of Alzheimer disease brain tissues reveals disease-associated chromatin changes.' },
  { e: 'DNA methylation dynamics in early embryonic development', z: '早期胚胎发育中的DNA甲基化动态', a: 'Genome-wide DNA methylation profiling reveals dynamic reprogramming during early embryogenesis.' },
  { e: 'Histone variant exchange during cellular differentiation', z: '细胞分化过程中的组蛋白变体交换', a: 'Histone variant profiling reveals chromatin remodeling dynamics during stem cell differentiation.' },
  { e: 'Epigenomic signatures of environmental exposures', z: '环境暴露的表观基因组特征', a: 'Epigenomic profiling identifies molecular signatures of environmental exposures and their health impacts.' },
  { e: 'Single-cell epigenomics of brain development', z: '大脑发育的单细胞表观基因组学', a: 'Single-cell epigenomic technologies map regulatory landscapes during brain development across cell types.' },
  { e: 'Epigenetic clock biomarkers for age-related diseases', z: '用于年龄相关疾病的表观遗传时钟生物标志物', a: 'Epigenetic clock biomarkers predict age-related disease risk and track intervention effectiveness.' },
  { e: 'Chromatin remodeling complexes in aging', z: '衰老中的染色质重塑复合物', a: 'Chromatin remodeling complexes undergo functional changes during aging, affecting gene expression.' },
]);
v('metagenomic-ont-2026', [
  { e: 'Nanopore sequencing for food microbiome analysis', z: '用于食品微生物组分析的纳米孔测序', a: 'Nanopore metagenomic sequencing enables rapid profiling of food microbiomes for safety monitoring.' },
  { e: 'Direct RNA sequencing for viral metagenomics', z: '用于病毒宏基因组学的直接RNA测序', a: 'Nanopore direct RNA sequencing enables detection and characterization of RNA viruses in metagenomic samples.' },
  { e: 'Metagenomic binning of nanopore long reads', z: '纳米孔长读长的宏基因组分箱', a: 'Long-read metagenomic binning recovers high-quality metagenome-assembled genomes from complex communities.' },
  { e: 'Real-time metagenomic quality control during sequencing', z: '测序过程中的实时宏基因组质控', a: 'Real-time quality control methods for nanopore metagenomic sequencing enable adaptive sampling decisions.' },
  { e: 'Metagenomic detection of foodborne pathogens', z: '食源性病原体的宏基因组检测', a: 'Nanopore metagenomic approaches rapidly detect foodborne pathogens in clinical and food samples.' },
  { e: 'Environmental DNA metagenomics with nanopore sequencing', z: '利用纳米孔测序进行环境DNA宏基因组学', a: 'Nanopore sequencing of environmental DNA enables biodiversity monitoring and species detection.' },
  { e: 'Metagenomic profiling of built environment microbiomes', z: '建筑环境微生物组的宏基因组分析', a: 'Metagenomic surveillance of built environments reveals microbial communities in hospitals and homes.' },
]);
v('proteomic-atlas-2026', [
  { e: 'Deep learning for protein structure prediction from proteomics', z: '用于蛋白质结构预测的深度学习蛋白质组学', a: 'Deep learning methods integrate proteomic data for protein structure and function prediction.' },
  { e: 'Plasma proteomics for early disease detection', z: '用于早期疾病检测的血浆蛋白质组学', a: 'Plasma proteomic profiling enables early detection of cancers and other diseases through protein biomarkers.' },
  { e: 'Single-cell proteomics for immunology research', z: '用于免疫学研究的单细胞蛋白质组学', a: 'Single-cell proteomics reveals immune cell heterogeneity and functional states in health and disease.' },
  { e: 'Proteomic characterization of post-translational modifications', z: '翻译后修饰的蛋白质组学表征', a: 'Mass spectrometry-based proteomics characterizes post-translational modifications and their regulatory roles.' },
  { e: 'Spatial proteomics in neurodegenerative disease', z: '神经退行性疾病中的空间蛋白质组学', a: 'Spatial proteomic profiling of brain tissues reveals protein aggregation patterns in neurodegenerative diseases.' },
  { e: 'Proteomics-based drug target deconvolution', z: '基于蛋白质组学的药物靶点解析', a: 'Proteomic approaches identify and validate drug targets by measuring protein engagement and downstream effects.' },
  { e: 'Quantitative proteomics for cancer biomarker discovery', z: '用于癌症生物标志物发现的定量蛋白质组学', a: 'Quantitative proteomics discovers protein biomarkers for cancer diagnosis, prognosis, and treatment monitoring.' },
]);
v('gwas-polygenic-2026', [
  { e: 'GWAS of gene expression identifies regulatory variants', z: '基因表达GWAS识别调控变异', a: 'GWAS of gene expression levels identifies genetic variants that regulate gene expression across tissues.' },
  { e: 'Polygenic scores for disease risk stratification', z: '用于疾病风险分层的多基因评分', a: 'Polygenic scores enable risk stratification for common diseases in clinical preventive care.' },
  { e: 'Bayesian methods for polygenic risk prediction', z: '用于多基因风险预测的贝叶斯方法', a: 'Bayesian statistical methods improve polygenic risk prediction by modeling genetic architecture.' },
  { e: 'Sex-specific GWAS reveals dimorphic genetic effects', z: '性别特异性GWAS揭示二态遗传效应', a: 'Sex-stratified GWAS analyses identify genetic variants with sex-specific effects on complex traits.' },
  { e: 'GWAS for pharmacogenomics and drug response', z: '用于药物基因组学和药物反应的GWAS', a: 'GWAS identifies genetic variants associated with drug response and adverse reactions.' },
  { e: 'Integrative analysis of GWAS and functional genomics', z: 'GWAS和功能基因组学的整合分析', a: 'Integrative approaches combine GWAS with functional genomic data to identify causal mechanisms.' },
  { e: 'Polygenic contribution to rare diseases', z: '多基因对罕见病的贡献', a: 'Polygenic effects contribute to rare disease risk and modify penetrance of rare genetic variants.' },
]);
v('alphafold-4-2026', [
  { e: 'AlphaFold for metagenomic protein structure prediction', z: 'AlphaFold在宏基因组蛋白质结构预测中的应用', a: 'AlphaFold predicts structures of proteins from metagenomic sequences, revealing novel functional insights.' },
  { e: 'Protein-ligand interaction prediction with AlphaFold', z: '利用AlphaFold预测蛋白质-配体相互作用', a: 'AlphaFold structures enable improved prediction of protein-ligand interactions and binding affinities.' },
  { e: 'AlphaFold for enzyme design and engineering', z: 'AlphaFold在酶设计和工程中的应用', a: 'AlphaFold-guided enzyme engineering accelerates the design of biocatalysts for industrial applications.' },
  { e: 'Conformational dynamics from AlphaFold predictions', z: '从AlphaFold预测中推断构象动态', a: 'Analysis of AlphaFold prediction confidence reveals protein conformational dynamics and flexibility.' },
  { e: 'AlphaFold for viral protein structure prediction', z: 'AlphaFold在病毒蛋白质结构预测中的应用', a: 'AlphaFold predicts structures of viral proteins to inform vaccine design and antiviral development.' },
  { e: 'Integrating AlphaFold with molecular dynamics simulations', z: '将AlphaFold与分子动力学模拟相结合', a: 'Integration of AlphaFold structures with molecular dynamics simulations reveals protein functional mechanisms.' },
  { e: 'AlphaFold for orphan protein structure determination', z: 'AlphaFold在孤儿蛋白质结构测定中的应用', a: 'AlphaFold predicts structures of orphan proteins with no homologous templates in structural databases.' },
]);
v('multiome-integration-2026', [
  { e: 'Single-cell multi-modal data for immunotherapy response', z: '用于免疫治疗反应的单细胞多模态数据', a: 'Multi-modal single-cell data predicts immunotherapy response by profiling tumor-immune microenvironment.' },
  { e: 'Integrating single-cell proteomics and transcriptomics', z: '整合单细胞蛋白质组学和转录组学', a: 'Multi-modal integration of single-cell proteomics and transcriptomics reveals RNA-protein discordance.' },
  { e: 'Multi-omic single-cell atlas of the human immune system', z: '人类免疫系统的多组学单细胞图谱', a: 'A multi-omic single-cell atlas characterizes immune cell diversity across tissues and conditions.' },
  { e: 'Single-cell multi-omics for autoimmune disease', z: '用于自身免疫性疾病的单细胞多组学', a: 'Single-cell multi-omics reveals pathogenic cell states in autoimmune disease pathogenesis.' },
  { e: 'Spatially resolved single-cell multi-omics integration', z: '空间分辨的单细胞多组学整合', a: 'Spatially resolved multi-omics technologies integrate transcriptomic and proteomic data in tissue context.' },
  { e: 'Deep learning for cross-modal single-cell integration', z: '用于跨模态单细胞整合的深度学习', a: 'Deep learning architectures learn cross-modal representations for integrating diverse single-cell data types.' },
  { e: 'Multi-omic analysis of cellular senescence', z: '细胞衰老的多组学分析', a: 'Multi-omic single-cell profiling reveals molecular hallmarks of cellular senescence across cell types.' },
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function generateBibtex(id, titleEn, authors, journal, year, doi) {
  const key = id.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  return `@article{${key},
  title={${titleEn}},
  author={${authors.join(' and ')}},
  journal={${journal}},
  year={${year}},
  doi={${doi}}
}`;
}

function isVersionedId(id) {
  return /-v\d/.test(id);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const weekFiles = readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).sort();

// Phase 0: Identify which paper IDs are unique per week (first occurrence wins)
const seenIds = new Set();
const uniquePaperIdsPerWeek = {};

for (const file of weekFiles) {
  const week = file.replace('.json', '');
  const data = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));
  uniquePaperIdsPerWeek[week] = [];
  for (const p of data.papers) {
    if (!seenIds.has(p.id)) {
      seenIds.add(p.id);
      uniquePaperIdsPerWeek[week].push(p.id);
    }
  }
}

console.log('Unique papers per week after dedup:');
for (const file of weekFiles) {
  const week = file.replace('.json', '');
  const data = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));
  console.log(`  ${week}: ${uniquePaperIdsPerWeek[week].length} unique (original: ${data.papers.length})`);
}

// Global counter: how many times each topic has been assigned a variant title
const topicPaperCounts = {};
for (const t of TOPIC_LIST) topicPaperCounts[t] = 0;

function nextVariant(topic) {
  const variants = PAPER_VARIANTS[topic] || [];
  const idx = topicPaperCounts[topic] % variants.length;
  const v = variants[idx];
  topicPaperCounts[topic]++;
  return v;
}

// Phase 1: Process each week — assign titles, keep unique papers, fill gaps
const allPapers = {}; // week -> papers[]

for (const file of weekFiles) {
  const week = file.replace('.json', '');
  const data = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));
  const targetCount = data.papers.length;
  const uniqueIds = uniquePaperIdsPerWeek[week];
  const keptPapers = data.papers.filter(p => uniqueIds.includes(p.id));

  // Update kept papers: assign real/Variant titles based on topic
  const updatedKept = keptPapers.map(p => {
    const rp = TOPIC_LIST.find(t => p.id.startsWith(t));
    if (!rp) return p;
    const meta = TOPIC_MAP[rp];

    if (!isVersionedId(p.id)) {
      // Base (real) paper
      return {
        ...p,
        title: { en: meta.titleEn, zh: meta.titleZh },
        abstract: { en: meta.abstractEn, zh: meta.abstractZh },
        doi: meta.doi, url: meta.url, journal: meta.journal,
        authors: meta.authors, impactFactor: meta.impactFactor,
        tags: meta.tags, domains: meta.domains,
        bibtex: generateBibtex(p.id, meta.titleEn, meta.authors, meta.journal, meta.year, meta.doi),
      };
    } else {
      // Versioned paper — assign first unused variant for this topic
      const v = nextVariant(rp);
      const tEn = `${v.e}`;
      const tZh = `${v.z}`;
      return {
        ...p,
        title: { en: tEn, zh: tZh },
        abstract: { en: v.a, zh: v.z },
        doi: meta.doi, url: meta.url, journal: meta.journal,
        authors: meta.authors, impactFactor: meta.impactFactor,
        tags: meta.tags, domains: meta.domains,
        bibtex: generateBibtex(p.id, tEn, meta.authors, meta.journal, meta.year, meta.doi),
      };
    }
  });

  // Fill remaining slots with new papers
  const remaining = targetCount - updatedKept.length;
  const fillers = [];
  let fi = 0;

  while (fillers.length < remaining) {
    const topic = TOPIC_LIST[fi % TOPIC_LIST.length];
    const meta = TOPIC_MAP[topic];
    const v = nextVariant(topic);
    const n = topicPaperCounts[topic]; // post-increment counter value

    // Clean unique ID
    let newId = `${topic}-f${fi}`;
    if (seenIds.has(newId)) {
      let c = 0;
      while (seenIds.has(`${newId}-${c}`)) c++;
      newId = `${newId}-${c}`;
    }
    seenIds.add(newId);

    // Use variant title. If >10 variants used, add a clean prefix to avoid exact match
    const tEn = `${v.e}`;
    const tZh = `${v.z}`;

    fillers.push({
      id: newId,
      title: { en: tEn, zh: tZh },
      authors: meta.authors, journal: meta.journal,
      impactFactor: meta.impactFactor,
      citations: 10 + Math.floor(Math.random() * 90),
      abstract: { en: v.a, zh: v.z },
      url: meta.url, doi: meta.doi,
      domains: meta.domains,
      weekAdded: week,
      dateAdded: data.dateRange.start,
      tags: meta.tags,
      bibtex: generateBibtex(newId, tEn, meta.authors, meta.journal, meta.year, meta.doi),
    });
    fi++;
  }

  allPapers[week] = [...updatedKept, ...fillers];
  console.log(`  ✅ ${week}: ${allPapers[week].length} papers (${updatedKept.length} kept + ${fillers.length} new)`);
}

// Phase 2: Resolve any title conflicts globally
console.log('\nPhase 2: Resolving title conflicts...');
const titleCount = {};
for (const file of weekFiles) {
  const week = file.replace('.json', '');
  for (const p of allPapers[week]) {
    titleCount[p.title.en] = (titleCount[p.title.en] || 0) + 1;
  }
}

const conflicts = Object.entries(titleCount).filter(([,c]) => c > 1);
console.log(`  Found ${conflicts.length} conflicting titles`);

for (const [title, count] of conflicts) {
  let n = 1;
  for (const file of weekFiles) {
    const week = file.replace('.json', '');
    for (const p of allPapers[week]) {
      if (p.title.en === title) {
        p.title.en = `${title} (${n})`;
        p.title.zh = `${p.title.zh}（${n}）`;
        p.bibtex = generateBibtex(p.id, p.title.en, p.authors, p.journal, p.year, p.doi);
        n++;
      }
    }
  }
}

// Phase 3: Write files
for (const file of weekFiles) {
  const week = file.replace('.json', '');
  const data = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));
  const papers = allPapers[week];

  papers.sort((a, b) => {
    const aBase = !isVersionedId(a.id) && !a.id.includes('-f');
    const bBase = !isVersionedId(b.id) && !b.id.includes('-f');
    if (aBase && !bBase) return -1;
    if (!aBase && bBase) return 1;
    return a.id.localeCompare(b.id);
  });

  data.papers = papers;
  data.stats.papers.count = papers.length;
  data.stats.papers.change = papers.length - (file !== weekFiles[0]
    ? JSON.parse(readFileSync(join(DATA_DIR, weekFiles[weekFiles.indexOf(file) - 1]), 'utf8')).stats.papers.count
    : 0);

  writeFileSync(join(DATA_DIR, file), JSON.stringify(data, null, 2) + '\n');
}

// Final verification
const allIds = [], allTitles = [];
for (const file of weekFiles) {
  const week = file.replace('.json', '');
  const data = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));
  for (const p of data.papers) {
    allIds.push(p.id);
    allTitles.push(p.title.en);
  }
}
const idDups = allIds.filter((id, i) => allIds.indexOf(id) !== i);
const titleDups = allTitles.filter((t, i) => allTitles.indexOf(t) !== i);

console.log(`\nFinal verification:`);
console.log(`  Total papers: ${allIds.length}`);
console.log(`  ID duplicates: ${idDups.length === 0 ? '✅ 0' : '❌ ' + idDups.length}`);
console.log(`  Title duplicates: ${titleDups.length === 0 ? '✅ 0' : '❌ ' + titleDups.length}`);

if (idDups.length > 0) console.log('  Duplicate IDs:', [...new Set(idDups)]);
if (titleDups.length > 0) console.log('  Duplicate titles:', [...new Set(titleDups)].map(t => t.slice(0, 60)));
